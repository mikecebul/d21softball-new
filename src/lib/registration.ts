import { formOptions } from "@tanstack/react-form"
import { z } from "zod"
import { canRegister } from "./data"
import type { ApiTournament } from "./tournaments"

export const classificationOptions = [
  { value: "B", label: "Men’s Class B" },
  { value: "C", label: "Men’s Class C" },
  { value: "D", label: "Men’s Class D" },
  { value: "E", label: "Men’s Class E" },
  { value: "Open", label: "Open" },
  { value: "50+", label: "50 & Over" },
  { value: "Unsure", label: "Not sure — confirm with the commissioner" },
] as const

export const rosterOptions = [
  { value: "10-12", label: "10–12 players" },
  { value: "13-15", label: "13–15 players" },
  { value: "16+", label: "16 or more players" },
] as const

export const roleOptions = [
  { value: "Manager", label: "Manager" },
  { value: "Coach", label: "Coach" },
  { value: "Player", label: "Player" },
  { value: "Other", label: "Other team representative" },
] as const

const text = (label: string, max = 100) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `Use ${max} characters or fewer.`)

export const detailsSchema = z.object({
  teamName: text("Team name"),
  hometown: text("Hometown"),
  classification: z
    .string()
    .refine(
      (value) => classificationOptions.some((option) => option.value === value),
      "Choose your team’s classification. Select ‘Not sure’ if you need help."
    ),
  rosterSize: z
    .string()
    .refine(
      (value) =>
        !value || rosterOptions.some((option) => option.value === value),
      "Choose an estimated roster size."
    ),
  firstName: text("First name"),
  lastName: text("Last name"),
  email: z
    .string()
    .trim()
    .max(254)
    .pipe(z.email("Enter a valid email address.")),
  phone: z
    .string()
    .trim()
    .refine(
      (value) =>
        /^[+\d\s().-]+$/.test(value) &&
        /^\d{10,15}$/.test(value.replace(/\D/g, "")),
      "Enter a phone number with 10–15 digits, including the area code."
    ),
  role: z
    .string()
    .refine(
      (value) => roleOptions.some((option) => option.value === value),
      "Choose your role with the team."
    ),
  notes: z
    .string()
    .trim()
    .max(1000, "Keep your notes to 1,000 characters or fewer."),
})

export const acknowledgementsSchema = z.object({
  rules: z
    .boolean()
    .refine(Boolean, "Please acknowledge the tournament rules."),
  authorized: z
    .boolean()
    .refine(Boolean, "Confirm that you are authorized to register this team."),
})

export function createTournamentSchema(
  tournaments: ApiTournament[],
  now?: Date
) {
  return z.object({
    slug: z.string().refine((slug) => {
      const tournament = tournaments.find((item) => item.slug === slug)
      return !!tournament && canRegister(tournament, now ?? new Date())
    }, "Choose a tournament that is open for registration."),
  })
}

export function createRegistrationSchema(
  tournaments: ApiTournament[],
  now?: Date
) {
  return z.object({
    tournament: createTournamentSchema(tournaments, now),
    details: detailsSchema,
    acknowledgements: acknowledgementsSchema,
  })
}

export function registrationDefaults(slug = "") {
  return {
    tournament: { slug },
    details: {
      teamName: "",
      hometown: "",
      classification: "",
      rosterSize: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "Manager",
      notes: "",
    },
    acknowledgements: { rules: false, authorized: false },
  }
}

export type RegistrationValues = ReturnType<typeof registrationDefaults>
export const registrationFormOptions = formOptions({
  defaultValues: registrationDefaults(),
})

// This contract deliberately omits prices and payment status. The backend must
// look up the tournament, recheck availability, and create its own payment order.
export function registrationSubmission(values: RegistrationValues) {
  const details = detailsSchema.parse(values.details)
  return {
    schemaVersion: 1 as const,
    tournamentSlug: values.tournament.slug,
    team: {
      name: details.teamName,
      hometown: details.hometown,
      classification: details.classification,
      estimatedRosterSize: details.rosterSize || null,
    },
    contact: {
      firstName: details.firstName,
      lastName: details.lastName,
      email: details.email.toLowerCase(),
      phone: details.phone,
      role: details.role,
    },
    notes: details.notes,
    acknowledgements: acknowledgementsSchema.parse(values.acknowledgements),
  }
}

export type RegistrationSubmission = ReturnType<typeof registrationSubmission>

export const REGISTRATION_DRAFT_KEY = "d21.registration-draft.v1"
const DRAFT_LIFETIME = 24 * 60 * 60 * 1000
const draftText = z.string().max(1000)
const draftSchema = z.object({
  version: z.literal(1),
  savedAt: z.number(),
  values: z.object({
    tournament: z.object({ slug: z.string().max(300) }),
    details: z.object({
      teamName: draftText,
      hometown: draftText,
      classification: draftText,
      rosterSize: draftText,
      firstName: draftText,
      lastName: draftText,
      email: draftText,
      phone: draftText,
      role: draftText,
      notes: draftText,
    }),
  }),
})

export function serializeRegistrationDraft(
  values: RegistrationValues,
  now = Date.now()
) {
  // Acknowledgments must be made again after a refresh; they are never saved.
  return JSON.stringify({
    version: 1,
    savedAt: now,
    values: { tournament: values.tournament, details: values.details },
  })
}

export function restoreRegistrationDraft(
  raw: string | null,
  tournaments: ApiTournament[],
  now = new Date()
): RegistrationValues | undefined {
  if (!raw) return undefined
  try {
    const result = draftSchema.safeParse(JSON.parse(raw))
    if (
      !result.success ||
      result.data.savedAt > now.getTime() ||
      now.getTime() - result.data.savedAt >= DRAFT_LIFETIME
    )
      return undefined
    const { values } = result.data
    const selected = tournaments.find(
      (item) => item.slug === values.tournament.slug
    )
    return {
      tournament: {
        slug: selected && canRegister(selected, now) ? selected.slug : "",
      },
      details: values.details,
      acknowledgements: { rules: false, authorized: false },
    }
  } catch {
    return undefined
  }
}

export function hasRegistrationDraft(values: RegistrationValues) {
  return (
    !!values.tournament.slug ||
    Object.entries(values.details).some(
      ([key, value]) => key !== "role" && value.trim().length > 0
    )
  )
}

export function entryFee(price: number | null) {
  return price !== null && Number.isFinite(price) && price >= 0
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(price)
    : "To be confirmed"
}
