import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
} from "payload"
import { describe, expect, it } from "vitest"
import {
  historyAccess,
  immutableHistoryFields,
  minorUnits,
  positiveInteger,
  preserveStripeIdentifiers,
  validatePaymentTotals,
} from "./history"

const changeArgs = (
  data: Record<string, unknown>,
  originalDoc: Record<string, unknown>
) =>
  ({
    data,
    originalDoc,
    operation: "update",
  }) as Parameters<CollectionBeforeChangeHook>[0]
const validationArgs = (
  data: Record<string, unknown>,
  originalDoc: Record<string, unknown> = {}
) =>
  ({
    data,
    originalDoc,
    operation: "update",
  }) as Parameters<CollectionBeforeValidateHook>[0]
const accessArgs = (authenticated: boolean) =>
  ({
    req: { user: authenticated ? { id: "staff", collection: "users" } : null },
  }) as Parameters<Access>[0]
const paid = {
  status: "succeeded",
  amountExpected: 60000,
  amountReceived: 60000,
  amountRefunded: 0,
  refunds: [],
}
const refund = {
  stripeRefundId: "re_partial",
  amount: 15000,
  status: "succeeded",
}

describe("private registration and payment history", () => {
  it("denies public reads, versions, and all direct mutations even for staff", async () => {
    expect(await historyAccess.read(accessArgs(false))).toBe(false)
    expect(await historyAccess.readVersions(accessArgs(false))).toBe(false)
    expect(await historyAccess.read(accessArgs(true))).toBe(true)
    for (const operation of ["create", "update", "delete"] as const) {
      expect(await historyAccess[operation](accessArgs(false))).toBe(false)
      expect(await historyAccess[operation](accessArgs(true))).toBe(false)
    }
  })
  it("preserves original answers while allowing server workflow updates", () => {
    const protect = immutableHistoryFields(["contact", "pricing", "submission"])
    const original = {
      contact: { email: "alex@example.com", firstName: "Alex" },
      pricing: { amountExpected: 60000 },
      submission: { id: "entry-1" },
    }
    expect(() =>
      protect(changeArgs({ contact: { email: "other@example.com" } }, original))
    ).toThrow(/original contact/)
    expect(() =>
      protect(changeArgs({ pricing: { amountExpected: 1 } }, original))
    ).toThrow(/original pricing/)
    expect(() =>
      protect(changeArgs({ submission: "entry-2" }, original))
    ).toThrow(/original submission/)
    expect(
      protect(
        changeArgs(
          {
            status: "confirmed",
            contact: { firstName: "Alex", email: "alex@example.com" },
            submission: "entry-1",
          },
          original
        )
      )
    ).toHaveProperty("status", "confirmed")
  })
  it("accepts Payload's expanded optional fields and dates without allowing changed answers", () => {
    const protect = immutableHistoryFields(["tournament"])
    const original = {
      tournament: { name: "Memorial", dateFrom: "2026-11-06T12:00:00.000Z" },
    }
    expect(
      protect(
        changeArgs(
          {
            tournament: {
              name: "Memorial",
              dateFrom: new Date("2026-11-06T12:00:00.000Z"),
              sourceId: undefined,
            },
          },
          original
        )
      )
    ).toHaveProperty("tournament.name", "Memorial")
    expect(() =>
      protect(
        changeArgs(
          {
            tournament: {
              ...original.tournament,
              dateFrom: "2026-11-07T12:00:00.000Z",
            },
          },
          original
        )
      )
    ).toThrow(/original tournament/)
  })
  it("allows adding Stripe identifiers once but rejects swapping or clearing checkout attempts", () => {
    expect(
      preserveStripeIdentifiers(
        changeArgs(
          { stripe: { checkoutSessionId: "cs_first" } },
          { stripe: {} }
        )
      )
    ).toHaveProperty("stripe.checkoutSessionId", "cs_first")
    expect(() =>
      preserveStripeIdentifiers(
        changeArgs(
          { stripe: { checkoutSessionId: "cs_second" } },
          { stripe: { checkoutSessionId: "cs_first" } }
        )
      )
    ).toThrow(/cannot be replaced/)
    expect(() =>
      preserveStripeIdentifiers(
        changeArgs(
          { stripe: null },
          { stripe: { checkoutSessionId: "cs_first" } }
        )
      )
    ).toThrow(/cannot be replaced/)
  })
})

describe("payment accounting", () => {
  it("rejects fractional, negative, unsafe, and missing required monetary values", () => {
    for (const value of [0.5, -1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
      expect(minorUnits(value)).not.toBe(true)
    expect(minorUnits(undefined, { required: true })).not.toBe(true)
    expect(minorUnits(undefined)).toBe(true)
    expect(minorUnits(60000, { required: true })).toBe(true)
    expect(positiveInteger(0)).not.toBe(true)
    expect(positiveInteger(undefined)).not.toBe(true)
  })
  it("prevents a partial collection being recorded as successful", () => {
    expect(() =>
      validatePaymentTotals(validationArgs({ ...paid, amountReceived: 10000 }))
    ).toThrow(/expected amount/)
    expect(validatePaymentTotals(validationArgs(paid))).toHaveProperty(
      "status",
      "succeeded"
    )
  })
  it("reconciles partial and full refunds against their original payment", () => {
    const partial = {
      ...paid,
      status: "partially_refunded",
      amountRefunded: 15000,
      refunds: [refund],
    }
    expect(validatePaymentTotals(validationArgs(partial))).toHaveProperty(
      "amountRefunded",
      15000
    )
    expect(() =>
      validatePaymentTotals(validationArgs({ ...partial, status: "refunded" }))
    ).toThrow(/entire amount/)
    expect(
      validatePaymentTotals(
        validationArgs({
          ...partial,
          amountRefunded: 60000,
          status: "refunded",
          refunds: [{ ...refund, amount: 60000 }],
        })
      )
    ).toHaveProperty("status", "refunded")
    expect(() =>
      validatePaymentTotals(
        validationArgs({
          ...partial,
          amountRefunded: 70000,
          refunds: [{ ...refund, amount: 70000 }],
        })
      )
    ).toThrow(/exceed/)
  })
  it("rejects duplicate refunds and mismatches between refund records and totals", () => {
    expect(() =>
      validatePaymentTotals(
        validationArgs({ ...paid, refunds: [refund, refund] })
      )
    ).toThrow(/only appear once/)
    expect(() =>
      validatePaymentTotals(validationArgs({ ...paid, amountRefunded: 15000 }))
    ).toThrow(/successful refund records/)
  })
  it("validates partial updates using previously received funds", () => {
    expect(
      validatePaymentTotals(
        validationArgs(
          {
            status: "partially_refunded",
            amountRefunded: 15000,
            refunds: [refund],
          },
          paid
        )
      )
    ).toHaveProperty("amountRefunded", 15000)
  })
})
