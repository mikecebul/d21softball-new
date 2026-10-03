import { randomUUID } from "node:crypto"
import type Stripe from "stripe"
import type { Payload, Where } from "payload"
import type { Payment, PaymentEvent } from "@/payload-types"
import {
  reconcileStatus,
  stripeID,
  verifySession,
} from "./payment-reconciliation"
import { getHistoryPayload, getStripe } from "./stripe.server"

export const monitoredEvents = new Set([
  "checkout.session.completed",
  "checkout.session.expired",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "payment_intent.processing",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
  "refund.created",
  "refund.updated",
  "refund.failed",
  "charge.dispute.created",
  "charge.dispute.updated",
  "charge.dispute.closed",
])

// An atomic, expiring MongoDB lease serializes webhook reconciliation across
// server instances. Only lock metadata bypasses Payload; financial writes use
// its hooks and version history. A crashed worker releases the lease by expiry.
type LockModel = {
  findOneAndUpdate: (
    filter: object,
    data: object,
    options: object
  ) => Promise<unknown>
  updateOne: (filter: object, data: object) => Promise<unknown>
}
async function paymentLease(payload: Payload, paymentId: string) {
  const model = (
    payload.db as unknown as { collections: Record<string, LockModel> }
  ).collections.payments
  const token = randomUUID()
  const now = new Date()
  const result = await model.findOneAndUpdate(
    {
      _id: paymentId,
      $or: [
        { "processingLock.until": { $lte: now } },
        { "processingLock.until": { $exists: false } },
        { "processingLock.until": null },
      ],
    },
    {
      $set: {
        "processingLock.token": token,
        "processingLock.until": new Date(now.getTime() + 120000),
      },
    },
    { returnDocument: "after" }
  )
  if (!result) return undefined
  const heartbeat = setInterval(() => {
    void model
      .updateOne(
        { _id: paymentId, "processingLock.token": token },
        { $set: { "processingLock.until": new Date(Date.now() + 120000) } }
      )
      .catch(() => {})
  }, 30000)
  return async () => {
    clearInterval(heartbeat)
    await model.updateOne(
      { _id: paymentId, "processingLock.token": token },
      { $unset: { processingLock: "" } }
    )
  }
}

export async function receiveWebhook(request: Request) {
  const signature = request.headers.get("stripe-signature")
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!secret)
    return Response.json(
      { error: "Webhook is not configured." },
      { status: 503 }
    )
  if (!signature)
    return Response.json({ error: "Missing signature." }, { status: 400 })
  const body = await request.text()
  let stripe: Stripe
  let event: Stripe.Event
  try {
    stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch {
    return Response.json(
      { error: "Invalid webhook signature or configuration." },
      { status: 400 }
    )
  }
  if (!monitoredEvents.has(event.type)) return Response.json({ received: true })
  const payload = await getHistoryPayload()
  const object = event.data.object as {
    id: string
    object: string
    metadata?: Record<string, string>
    payment_intent?: string | { id: string } | null
    charge?: string | { id: string }
    amount?: number
    currency?: string
    status?: string
  }
  const findEvent = async (): Promise<PaymentEvent | undefined> =>
    (
      await payload.find({
        collection: "payment-events",
        where: { stripeEventId: { equals: event.id } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
    ).docs[0]
  let stored = await findEvent()
  if (
    stored?.processingStatus === "processed" ||
    stored?.processingStatus === "ignored"
  )
    return Response.json({ received: true })
  let payment: Payment | undefined
  let metadata = object.metadata
  if (
    object.metadata?.site === "d21softball" &&
    /^[a-f\d]{24}$/i.test(object.metadata.paymentId)
  ) {
    payment = (
      await payload.find({
        collection: "payments",
        where: { id: { equals: object.metadata.paymentId } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
    ).docs[0]
  }
  if (!payment) {
    const intentId =
      object.object === "payment_intent"
        ? object.id
        : stripeID(object.payment_intent)
    const chargeId = stripeID(object.charge)
    const clauses: Where[] = [
      ...(object.object === "checkout.session"
        ? [{ "stripe.checkoutSessionId": { equals: object.id } }]
        : []),
      ...(intentId ? [{ "stripe.paymentIntentId": { equals: intentId } }] : []),
      ...(chargeId ? [{ "stripe.latestChargeId": { equals: chargeId } }] : []),
    ]
    if (clauses.length)
      payment = (
        await payload.find({
          collection: "payments",
          where: { or: clauses },
          depth: 0,
          limit: 1,
          overrideAccess: true,
        })
      ).docs[0]
  }
  // Refund/dispute events can precede the event that saves the PaymentIntent ID.
  // Follow its metadata before deciding this verified event belongs elsewhere.
  if (!payment && ["refund", "dispute"].includes(object.object)) {
    const intentId = stripeID(object.payment_intent)
    if (intentId) {
      metadata = (await stripe.paymentIntents.retrieve(intentId)).metadata
      if (
        metadata.site === "d21softball" &&
        /^[a-f\d]{24}$/i.test(metadata.paymentId)
      ) {
        payment = (
          await payload.find({
            collection: "payments",
            where: { id: { equals: metadata.paymentId } },
            limit: 1,
            depth: 0,
            overrideAccess: true,
          })
        ).docs[0]
      }
    }
  }
  if (!stored) {
    try {
      stored = await payload.create({
        collection: "payment-events",
        overrideAccess: true,
        data: {
          processingStatus: "received",
          processingAttempts: 0,
          receivedAt: new Date().toISOString(),
          stripeEventId: event.id,
          eventType: event.type,
          stripeObjectId: object.id,
          payment: payment?.id,
          livemode: event.livemode,
          stripeCreatedAt: new Date(event.created * 1000).toISOString(),
          signatureVerifiedAt: new Date().toISOString(),
          summary: {
            objectType: object.object,
            amount: object.amount,
            currency: object.currency,
            stripeStatus: object.status,
            chargeId: stripeID(object.charge),
            refundId: object.object === "refund" ? object.id : undefined,
          },
        },
      })
    } catch (error) {
      stored = await findEvent()
      if (!stored) throw error
    }
  }
  if (!payment) {
    // Our own session may arrive before the create request has saved its IDs.
    // Keep it retryable instead of acknowledging an unfinished registration.
    const ours = metadata?.site === "d21softball"
    await payload.update({
      collection: "payment-events",
      id: stored.id,
      overrideAccess: true,
      data: {
        processingStatus: ours ? "failed" : "ignored",
        error: ours ? "Payment record is not ready yet." : undefined,
      },
    })
    return Response.json({ received: !ours }, { status: ours ? 503 : 200 })
  }
  const release = await paymentLease(payload, payment.id)
  if (!release)
    return Response.json(
      { error: "Payment reconciliation is busy. Retry." },
      { status: 503 }
    )
  try {
    stored = await payload.findByID({
      collection: "payment-events",
      id: stored.id,
      overrideAccess: true,
      depth: 0,
    })
    if (stored.processingStatus === "processed")
      return Response.json({ received: true })
    await payload.update({
      collection: "payment-events",
      id: stored.id,
      overrideAccess: true,
      data: {
        payment: payment.id,
        processingAttempts: stored.processingAttempts + 1,
        lastAttemptAt: new Date().toISOString(),
      },
    })
    payment = await payload.findByID({
      collection: "payments",
      id: payment.id,
      overrideAccess: true,
      depth: 0,
    })
    if (event.livemode !== payment.livemode || event.account)
      throw new Error("Stripe event account or mode does not match.")
    if (!payment.stripe?.checkoutSessionId)
      throw new Error("Checkout session has not been saved yet.")
    const submissionId = stripeID(payment.submission)!
    const session = await stripe.checkout.sessions.retrieve(
      payment.stripe.checkoutSessionId
    )
    verifySession(session, payment, submissionId)
    const intentId = stripeID(session.payment_intent)
    const intent = intentId
      ? await stripe.paymentIntents.retrieve(intentId, {
          expand: ["latest_charge"],
        })
      : undefined
    if (
      intent &&
      (intent.livemode !== payment.livemode ||
        intent.amount !== payment.amountExpected ||
        intent.currency !== payment.currency ||
        intent.metadata.paymentId !== payment.id ||
        intent.metadata.submissionId !== submissionId)
    )
      throw new Error("Stripe PaymentIntent does not match.")
    const charge =
      intent?.latest_charge && typeof intent.latest_charge !== "string"
        ? intent.latest_charge
        : undefined
    const refunds: NonNullable<Payment["refunds"]> = []
    if (
      (intentId && charge && charge.amount_refunded > 0) ||
      object.object === "refund"
    ) {
      if (!intentId) throw new Error("Refund has no PaymentIntent.")
      for await (const refund of stripe.refunds.list({
        payment_intent: intentId,
        limit: 100,
      })) {
        if (refund.currency !== payment.currency || refund.amount < 0)
          throw new Error("Refund currency or amount does not match.")
        const refundStatus = refund.status ?? "pending"
        if (
          ![
            "pending",
            "requires_action",
            "succeeded",
            "failed",
            "canceled",
          ].includes(refundStatus)
        )
          throw new Error("Unsupported refund status.")
        refunds.push({
          stripeRefundId: refund.id,
          amount: refund.amount,
          status: refundStatus as NonNullable<
            Payment["refunds"]
          >[number]["status"],
          reason: refund.reason ?? undefined,
          createdAt: new Date(refund.created * 1000).toISOString(),
          failureReason: refund.failure_reason ?? undefined,
        })
      }
    } else if (payment.refunds?.length) {
      // Preserve failed/pending refunds even when the successful total is zero.
      refunds.push(...payment.refunds)
    }
    const amountRefunded = refunds
      .filter((item) => item.status === "succeeded")
      .reduce((total, item) => total + item.amount, 0)
    const status = reconcileStatus(session, intent, amountRefunded)
    const now = new Date().toISOString()
    const paid = ["succeeded", "partially_refunded", "refunded"].includes(
      status
    )
    await payload.update({
      collection: "payments",
      id: payment.id,
      overrideAccess: true,
      data: {
        status,
        amountReceived: intent?.amount_received ?? 0,
        amountRefunded,
        refunds,
        stripe: {
          ...payment.stripe,
          paymentIntentId: intentId,
          latestChargeId: stripeID(intent?.latest_charge),
          customerId: stripeID(session.customer),
          receiptUrl: charge?.receipt_url ?? undefined,
          paymentMethodType: charge?.payment_method_details?.type,
        },
        ...(paid && !payment.succeededAt ? { succeededAt: now } : {}),
        ...(status === "expired"
          ? { expiredAt: payment.expiredAt ?? now }
          : {}),
        ...(status === "cancelled"
          ? { cancelledAt: payment.cancelledAt ?? now }
          : {}),
        ...(status === "failed"
          ? {
              failedAt: now,
              failure: {
                code: intent?.last_payment_error?.code,
                declineCode: intent?.last_payment_error?.decline_code,
                message: "Payment was declined or could not be completed.",
              },
            }
          : {}),
      },
    })
    if (paid) {
      const entry = await payload.findByID({
        collection: "form-submissions",
        id: submissionId,
        depth: 0,
        overrideAccess: true,
      })
      if (entry.status === "submitted")
        await payload.update({
          collection: "form-submissions",
          id: entry.id,
          overrideAccess: true,
          data: { status: "confirmed", confirmedAt: now },
        })
    }
    if (object.object === "dispute") {
      const dispute = await stripe.disputes.retrieve(object.id)
      if (stripeID(dispute.payment_intent) !== intentId)
        throw new Error("Dispute does not match the payment.")
      await payload.update({
        collection: "payments",
        id: payment.id,
        overrideAccess: true,
        data: {
          dispute: {
            stripeDisputeId: dispute.id,
            status: dispute.status,
            reason: dispute.reason,
            amount: dispute.amount,
            updatedAt: now,
          },
        },
      })
    }
    await payload.update({
      collection: "payment-events",
      id: stored.id,
      overrideAccess: true,
      data: { processingStatus: "processed", processedAt: now, error: null },
    })
    return Response.json({ received: true })
  } catch (error) {
    const code = (error as { code?: string }).code
    payload.logger.error({
      msg: "Stripe webhook reconciliation failed",
      eventId: event.id,
      code,
    })
    await payload.update({
      collection: "payment-events",
      id: stored.id,
      overrideAccess: true,
      data: {
        processingStatus: "failed",
        error:
          "Could not reconcile with Stripe. Check permissions and retry delivery.",
      },
    })
    return Response.json(
      { error: "Payment reconciliation failed. Retry." },
      { status: 503 }
    )
  } finally {
    await release()
  }
}
