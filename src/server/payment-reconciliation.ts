import type Stripe from "stripe"
import type { Payment } from "@/payload-types"

export function stripeID(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id
}

export function verifySession(
  session: Stripe.Checkout.Session,
  payment: Payment,
  submissionId: string
) {
  if (
    session.mode !== "payment" ||
    session.livemode !== payment.livemode ||
    session.currency !== payment.currency ||
    session.amount_total !== payment.amountExpected ||
    session.metadata?.paymentId !== payment.id ||
    session.metadata.submissionId !== submissionId ||
    session.client_reference_id !== submissionId ||
    session.id !== payment.stripe?.checkoutSessionId
  ) {
    throw new Error("Stripe session does not match the stored payment.")
  }
}

export function reconcileStatus(
  session: Stripe.Checkout.Session,
  intent: Stripe.PaymentIntent | undefined,
  refunded: number
) {
  if (session.payment_status === "paid") {
    if (
      !intent ||
      intent.status !== "succeeded" ||
      intent.amount_received !== session.amount_total ||
      intent.currency !== session.currency
    )
      throw new Error("Stripe has not verified the full payment.")
    if (refunded > intent.amount_received)
      throw new Error("Refunds exceed the received payment.")
    return refunded === intent.amount_received
      ? "refunded"
      : refunded > 0
        ? "partially_refunded"
        : "succeeded"
  }
  if (session.status === "expired") return "expired"
  if (intent?.status === "canceled") return "cancelled"
  if (intent?.status === "processing") return "processing"
  if (intent?.last_payment_error) return "failed"
  return "pending"
}
