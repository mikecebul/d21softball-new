import { describe, expect, it, vi } from "vitest"
import type { FormSubmission } from "@/payload-types"
import type { CheckoutInput } from "@/lib/checkout-contract"
import { checkoutInputSchema } from "@/lib/checkout-contract"
import { entryAmount, sameSubmission } from "./checkout.server"

vi.mock("@/lib/tournaments", () => ({ fetchTournamentBySlug: vi.fn() }))

const submission: CheckoutInput["submission"] = {
  schemaVersion: 2,
  tournamentSlug: "test-weekend",
  team: { name: "Test team", hometown: "Petoskey" },
  contact: {
    firstName: "Test",
    lastName: "Manager",
    email: "test@example.com",
    phone: "2315550100",
    role: "Manager",
  },
  notes: "",
  acknowledgements: { rules: true, authorized: true },
}

describe("checkout input and immutable retry identity", () => {
  it("accepts cent-accurate fees and rejects unavailable, fractional, or unsafe fees", () => {
    expect(entryAmount(600)).toBe(60000)
    expect(entryAmount(123.45)).toBe(12345)
    for (const price of [
      null,
      0,
      -1,
      NaN,
      Infinity,
      600.001,
      Number.MAX_SAFE_INTEGER,
    ]) {
      expect(() => entryAmount(price)).toThrow()
    }
  })

  it("strips browser-supplied prices and payment status and requires consent", () => {
    const raw = {
      submissionKey: "0fd3d1b7-5480-49ad-8aa4-96fd53c16041",
      submission: { ...submission, price: 1, paymentStatus: "paid" },
    }
    const parsed = checkoutInputSchema.parse(raw)
    expect(parsed.submission).toEqual(submission)
    expect(
      checkoutInputSchema.safeParse({
        ...raw,
        submission: {
          ...submission,
          acknowledgements: { rules: false, authorized: true },
        },
      }).success
    ).toBe(false)
  })

  it("reuses a key only for identical original answers", () => {
    const stored = {
      ...submission,
      tournament: { slug: submission.tournamentSlug },
      notes: undefined,
    } as unknown as FormSubmission
    expect(sameSubmission(stored, submission)).toBe(true)
    for (const changed of [
      { team: { ...submission.team, name: "Another team" } },
      { contact: { ...submission.contact, email: "other@example.com" } },
      { notes: "New information" },
      { tournamentSlug: "another-weekend" },
    ])
      expect(sameSubmission(stored, { ...submission, ...changed })).toBe(false)
  })
})
