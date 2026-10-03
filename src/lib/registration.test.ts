import { describe, expect, it } from "vitest"
import { canRegister } from "./data"
import type { ApiTournament } from "./tournaments"
import {
  acknowledgementsSchema,
  createRegistrationSchema,
  detailsSchema,
  entryFee,
  registrationDefaults,
  restoreRegistrationDraft,
  serializeRegistrationDraft,
} from "./registration"

const now = new Date("2026-06-01T12:00:00Z")
const tournament = {
  name: "Summer invitational",
  date_to: "2026-06-21T16:00:00Z",
  content: "LIMIT OF 5 TEAMS",
  meta_description: null,
  teams: [],
} as unknown as ApiTournament

describe("registration eligibility", () => {
  it("allows an upcoming tournament with available places", () => {
    expect(canRegister(tournament, now)).toBe(true)
  })
  it("rejects a completed tournament even when it has no paid teams", () => {
    expect(
      canRegister({ ...tournament, date_to: "2025-06-21T16:00:00Z" }, now)
    ).toBe(false)
  })
  it("rejects a sold-out tournament", () => {
    const teams = Array.from({ length: 5 }, (_, id) => ({
      id,
      team: `Team ${id}`,
      isPaid: true,
    }))
    expect(canRegister({ ...tournament, teams }, now)).toBe(false)
  })
  it("keeps an unpaid entry from consuming a confirmed place", () => {
    const teams = Array.from({ length: 5 }, (_, id) => ({
      id,
      team: `Team ${id}`,
      isPaid: id < 4,
    }))
    expect(canRegister({ ...tournament, teams }, now)).toBe(true)
  })
})

describe("registration validation and recovery", () => {
  const values = {
    ...registrationDefaults("summer"),
    details: {
      teamName: " Bay Sox ",
      hometown: "Petoskey, MI",
      classification: "C",
      rosterSize: "",
      firstName: "Alex",
      lastName: "Kelly",
      email: " alex@example.com ",
      phone: "+1 (231) 555-0100",
      role: "Manager",
      notes: "",
    },
    acknowledgements: { rules: true, authorized: true },
  }
  const open = { ...tournament, slug: "summer" }

  it("normalizes names and accepts optional roster information", () => {
    const result = createRegistrationSchema([open], now).parse(values)
    expect(result.details.teamName).toBe("Bay Sox")
    expect(result.details.email).toBe("alex@example.com")
  })
  it("rejects invalid phone numbers, unknown classifications and missing acknowledgments", () => {
    expect(
      detailsSchema.safeParse({ ...values.details, phone: "1234567" }).success
    ).toBe(false)
    expect(
      detailsSchema.safeParse({ ...values.details, classification: "invalid" })
        .success
    ).toBe(false)
    expect(
      acknowledgementsSchema.safeParse({ rules: false, authorized: true })
        .success
    ).toBe(false)
  })
  it("keeps unfinished field values but requires fresh acknowledgments after restore", () => {
    const raw = serializeRegistrationDraft(
      { ...values, details: { ...values.details, email: "unfinished@" } },
      now.getTime()
    )
    const restored = restoreRegistrationDraft(raw, [open], now)
    expect(restored?.details.email).toBe("unfinished@")
    expect(restored?.acknowledgements).toEqual({
      rules: false,
      authorized: false,
    })
  })
  it("rejects expired, corrupted and future-dated drafts", () => {
    expect(restoreRegistrationDraft("not json", [open], now)).toBeUndefined()
    expect(
      restoreRegistrationDraft(
        serializeRegistrationDraft(values, now.getTime() - 86_400_000),
        [open],
        now
      )
    ).toBeUndefined()
    expect(
      restoreRegistrationDraft(
        serializeRegistrationDraft(values, now.getTime() + 1),
        [open],
        now
      )
    ).toBeUndefined()
  })
  it("clears a closed tournament from a draft while keeping the team details", () => {
    const restored = restoreRegistrationDraft(
      serializeRegistrationDraft(values, now.getTime()),
      [{ ...open, date_to: "2025-06-21" }],
      now
    )
    expect(restored?.tournament.slug).toBe("")
    expect(restored?.details.teamName).toBe(values.details.teamName)
  })
  it("distinguishes a free entry from an unannounced fee", () => {
    expect(entryFee(0)).toBe("$0")
    expect(entryFee(450.5)).toBe("$450.50")
    expect(entryFee(null)).toBe("To be confirmed")
  })
})
