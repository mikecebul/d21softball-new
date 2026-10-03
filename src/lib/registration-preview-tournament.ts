import type { ApiTournament } from "@/lib/tournaments"

export const REGISTRATION_PREVIEW_SLUG = "registration-preview"

/** A sample weekend that stays upcoming whenever the development app starts. */
export function createRegistrationPreviewTournament(
  now = new Date()
): ApiTournament {
  const start = new Date(now)
  start.setUTCHours(12, 0, 0, 0)
  start.setUTCDate(start.getUTCDate() + 28)
  start.setUTCDate(start.getUTCDate() + ((5 - start.getUTCDay() + 7) % 7))
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 2)
  const timestamp = now.toISOString()

  return {
    id: -1,
    name: "Test Tournament — Registration Preview",
    slug: REGISTRATION_PREVIEW_SLUG,
    content:
      "<p>Sample tournament for testing the registration form. LIMIT OF 12 TEAMS. This is not a scheduled event.</p>",
    meta_description: null,
    meta_title: null,
    price: 600,
    published_at: timestamp,
    created_at: timestamp,
    updated_at: timestamp,
    date_from: start.toISOString(),
    date_to: end.toISOString(),
    class: "Men’s Class C & D",
    location: "Waterfront Park, Petoskey",
    bracketResults: null,
    teams: [],
    image: null,
    finalBracket: null,
    resultsMedia: [],
  }
}
