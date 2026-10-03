import type Stripe from "stripe"
import type { Payment } from "@/payload-types"
import { describe, expect, it } from "vitest"
import { reconcileStatus, verifySession } from "./payment-reconciliation"

const payment = {
  id: "payment-1",
  amountExpected: 60000,
  currency: "usd",
  livemode: false,
  stripe: { checkoutSessionId: "cs_test_1" },
} as Payment
const session = {
  id: "cs_test_1",
  mode: "payment",
  status: "complete",
  livemode: false,
  amount_total: 60000,
  currency: "usd",
  payment_status: "paid",
  client_reference_id: "entry-1",
  metadata: { paymentId: "payment-1", submissionId: "entry-1" },
} as unknown as Stripe.Checkout.Session
const intent = {
  status: "succeeded",
  amount_received: 60000,
  currency: "usd",
} as Stripe.PaymentIntent

describe("verified payment reconciliation", () => {
  it("rejects mismatched Stripe amounts, mode, currency, identity, and metadata", () => {
    expect(() => verifySession(session, payment, "entry-1")).not.toThrow()
    for (const changed of [
      { amount_total: 1 },
      { livemode: true },
      { currency: "eur" },
      { id: "cs_other" },
      { metadata: { paymentId: "other", submissionId: "entry-1" } },
      { client_reference_id: "other" },
    ]) {
      expect(() =>
        verifySession({ ...session, ...changed }, payment, "entry-1")
      ).toThrow(/does not match/)
    }
  })
  it("does not treat completion or a success redirect as payment", () => {
    expect(
      reconcileStatus({ ...session, payment_status: "unpaid" }, undefined, 0)
    ).toBe("pending")
    expect(() => reconcileStatus(session, undefined, 0)).toThrow(/verified/)
    expect(() =>
      reconcileStatus(session, { ...intent, amount_received: 100 }, 0)
    ).toThrow(/verified/)
  })
  it("tracks successful payments and reconciles partial and full refunds", () => {
    expect(reconcileStatus(session, intent, 0)).toBe("succeeded")
    expect(reconcileStatus(session, intent, 15000)).toBe("partially_refunded")
    expect(reconcileStatus(session, intent, 60000)).toBe("refunded")
    expect(() => reconcileStatus(session, intent, 70000)).toThrow(/exceed/)
  })
  it("tracks expiry, cancellation, delayed processing, and retryable declines", () => {
    const unpaid = { ...session, payment_status: "unpaid" as const }
    expect(
      reconcileStatus({ ...unpaid, status: "expired" }, undefined, 0)
    ).toBe("expired")
    expect(reconcileStatus(unpaid, { ...intent, status: "canceled" }, 0)).toBe(
      "cancelled"
    )
    expect(
      reconcileStatus(unpaid, { ...intent, status: "processing" }, 0)
    ).toBe("processing")
    expect(
      reconcileStatus(
        unpaid,
        {
          ...intent,
          last_payment_error: {
            code: "card_declined",
          } as Stripe.PaymentIntent.LastPaymentError,
        },
        0
      )
    ).toBe("failed")
  })
})
