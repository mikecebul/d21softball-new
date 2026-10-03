import { randomUUID } from "node:crypto"
import { isDeepStrictEqual } from "node:util"
import { checkoutInputSchema } from "@/lib/checkout-contract"
import { canRegister, spotsLeftFor } from "@/lib/data"
import { fetchTournamentBySlug } from "@/lib/tournaments"
import {
  createRegistrationPreviewTournament,
  REGISTRATION_PREVIEW_SLUG,
} from "@/lib/registration-preview-tournament"
import {
  CheckoutError,
  checkoutOrigin,
  getHistoryPayload,
  getStripe,
  stripeFailure,
  stripeIsLive,
} from "./stripe.server"
import type { CheckoutInput } from "@/lib/checkout-contract"
import type { FormSubmission, Payment } from "@/payload-types"

export function entryAmount(price: number | null) {
  if (price === null || !Number.isFinite(price) || price <= 0)
    throw new CheckoutError(
      "This tournament does not have an online entry fee."
    )
  const cents = Math.round(price * 100)
  if (!Number.isSafeInteger(cents) || Math.abs(price * 100 - cents) > 0.000001)
    throw new CheckoutError("The tournament entry fee is invalid.")
  return cents
}

export function sameSubmission(
  stored: FormSubmission,
  input: CheckoutInput["submission"]
) {
  return (
    stored.schemaVersion === input.schemaVersion &&
    stored.tournament.slug === input.tournamentSlug &&
    isDeepStrictEqual(stored.team, input.team) &&
    isDeepStrictEqual(stored.contact, input.contact) &&
    (stored.notes ?? "") === input.notes &&
    stored.acknowledgements.rules === input.acknowledgements.rules &&
    stored.acknowledgements.authorized === input.acknowledgements.authorized
  )
}

export async function startCheckout(raw: unknown, request: Request) {
  const parsed = checkoutInputSchema.safeParse(raw)
  if (!parsed.success)
    throw new CheckoutError(
      "Check your registration details and required acknowledgments."
    )
  const { submissionKey, submission } = parsed.data
  const origin = checkoutOrigin(request)
  if (request.headers.get("origin") !== origin)
    throw new CheckoutError(
      "Registration must be submitted from this website.",
      403
    )
  const stripe = getStripe()
  const livemode = stripeIsLive()
  const preview = submission.tournamentSlug === REGISTRATION_PREVIEW_SLUG
  if (preview && (!import.meta.env.DEV || livemode))
    throw new CheckoutError(
      "The sample tournament only accepts test payments in development."
    )
  const tournament = preview
    ? createRegistrationPreviewTournament()
    : await fetchTournamentBySlug(submission.tournamentSlug)
  if (!tournament || !canRegister(tournament))
    throw new CheckoutError(
      "This tournament is no longer open for registration."
    )
  const amountExpected = entryAmount(tournament.price)
  const payload = await getHistoryPayload()
  const findSubmission = async (): Promise<FormSubmission | undefined> =>
    (
      await payload.find({
        collection: "form-submissions",
        where: { submissionKey: { equals: submissionKey } },
        depth: 0,
        limit: 1,
        overrideAccess: true,
      })
    ).docs[0]
  let entry = await findSubmission()
  if (entry && !sameSubmission(entry, submission))
    throw new CheckoutError(
      "This submission key belongs to different details. Start a new registration.",
      409
    )
  if (entry?.status === "cancelled")
    throw new CheckoutError(
      "This registration was cancelled. Start a new registration.",
      409
    )
  if (
    entry &&
    (entry.pricing.amountExpected !== amountExpected ||
      entry.pricing.currency !== "usd")
  )
    throw new CheckoutError(
      "The entry fee changed. Start a new registration to review the current fee.",
      409
    )
  if (!entry) {
    const confirmed = await payload.count({
      collection: "form-submissions",
      where: {
        and: [
          { "tournament.slug": { equals: tournament.slug } },
          { status: { equals: "confirmed" } },
        ],
      },
      overrideAccess: true,
    })
    if (confirmed.totalDocs >= spotsLeftFor(tournament))
      throw new CheckoutError("This tournament is full.", 409)
    try {
      entry = await payload.create({
        collection: "form-submissions",
        overrideAccess: true,
        data: {
          submissionKey,
          formType: "tournament-registration",
          source: "website",
          status: "submitted",
          submittedAt: new Date().toISOString(),
          schemaVersion: submission.schemaVersion,
          tournament: {
            slug: tournament.slug,
            sourceId: String(tournament.id),
            name: tournament.name,
            dateFrom: tournament.date_from,
            dateTo: tournament.date_to,
            location: tournament.location,
          },
          team: submission.team,
          contact: submission.contact,
          notes: submission.notes,
          acknowledgements: {
            ...submission.acknowledgements,
            acceptedAt: new Date().toISOString(),
            rulesUrl: "/rules",
          },
          pricing: { amountExpected, currency: "usd" },
        },
      })
    } catch (error) {
      entry = await findSubmission()
      if (!entry || !sameSubmission(entry, submission)) throw error
    }
  }
  const currentEntry = entry
  const latest = async (): Promise<Payment | undefined> =>
    (
      await payload.find({
        collection: "payments",
        where: { submission: { equals: currentEntry.id } },
        sort: "-attemptNumber",
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
    ).docs[0]
  let payment = await latest()
  if (payment && payment.livemode !== livemode)
    throw new CheckoutError(
      "The payment mode changed. Start a new registration.",
      409
    )
  if (payment?.stripe?.checkoutSessionId) {
    const session = await stripe.checkout.sessions.retrieve(
      payment.stripe.checkoutSessionId
    )
    if (session.status === "open" && session.url) return { url: session.url }
    if (session.status === "complete")
      return {
        url: `${origin}/register/success?session_id=${encodeURIComponent(session.id)}`,
      }
    await payload.update({
      collection: "payments",
      id: payment.id,
      overrideAccess: true,
      data: { status: "expired", expiredAt: new Date().toISOString() },
    })
    payment = undefined
  }
  if (currentEntry.status === "confirmed")
    throw new CheckoutError("This team is already registered.", 409)
  if (!payment) {
    const previous = await latest()
    try {
      payment = await payload.create({
        collection: "payments",
        overrideAccess: true,
        data: {
          paymentKey: randomUUID(),
          provider: "stripe",
          status: "pending",
          amountReceived: 0,
          amountRefunded: 0,
          submission: currentEntry.id,
          attemptNumber: (previous?.attemptNumber ?? 0) + 1,
          amountExpected,
          currency: "usd",
          livemode,
        },
      })
    } catch (error) {
      payment = await latest()
      if (
        !payment ||
        payment.attemptNumber !== (previous?.attemptNumber ?? 0) + 1
      )
        throw error
    }
  }
  const attempt: Payment = payment
  try {
    const metadata = {
      submissionId: currentEntry.id,
      paymentId: attempt.id,
      site: "d21softball",
    }
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: submission.contact.email,
        client_reference_id: currentEntry.id,
        success_url: `${origin}/register/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/register?tournament=${encodeURIComponent(tournament.slug)}`,
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: amountExpected,
              product_data: {
                name: currentEntry.tournament.name,
                description: `Team entry: ${submission.team.name}`,
              },
            },
            quantity: 1,
          },
        ],
        metadata,
        payment_intent_data: { metadata },
      },
      { idempotencyKey: attempt.paymentKey }
    )
    if (!session.url || session.livemode !== livemode)
      throw new CheckoutError("Stripe did not return a checkout URL.", 502)
    await payload.update({
      collection: "payments",
      id: attempt.id,
      overrideAccess: true,
      data: {
        stripe: {
          checkoutSessionId: session.id,
          checkoutExpiresAt: new Date(session.expires_at * 1000).toISOString(),
        },
      },
    })
    return { url: session.url }
  } catch (error) {
    const failure = stripeFailure(error)
    await payload.update({
      collection: "payments",
      id: attempt.id,
      overrideAccess: true,
      data: { failure, failedAt: new Date().toISOString() },
    })
    payload.logger.error({
      msg: "Registration checkout failed",
      code: failure.code,
    })
    throw new CheckoutError(
      "We couldn’t start checkout. Your registration is saved; please retry or contact Scott Kelly.",
      502
    )
  }
}
