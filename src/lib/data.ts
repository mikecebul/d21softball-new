import type { ApiTournament } from "./tournaments"

export type TournamentStatus =
  "open" | "filling" | "full" | "closed" | "completed"

export const SEASON_YEAR = 2026

/** Earliest season available from the tournaments API. */
export const FIRST_SEASON_YEAR = 2003

/** Seasons with no play (COVID). The API holds no tournaments for these years. */
export const SKIPPED_SEASON_YEARS: number[] = [2020]

/** All seasons with tournament data, newest first. */
export function seasonYears(): number[] {
  const years: number[] = []
  for (let y = SEASON_YEAR; y >= FIRST_SEASON_YEAR; y--) {
    if (!SKIPPED_SEASON_YEARS.includes(y)) years.push(y)
  }
  return years
}

export interface Sponsor {
  name: string
  url?: string | null
  logo?: string
}

// Sponsor names, logos and destinations from d21softball.org.
export const sponsors: Sponsor[] = [
  {
    name: "Polaris Home Funding",
    url: "https://www.polarishfc.com",
    logo: "/images/sponsors/Polaris_Logo_7bab6974ff.png",
  },
  {
    name: "Petoskey Area",
    url: "https://www.petoskeyarea.com/",
    logo: "/images/sponsors/petoskey_area_f8a18823a2.png",
  },
  {
    name: "DJS Holdings",
    url: null,
    logo: "/images/sponsors/pm_logo_djs_ab8d06ccf5.jpg",
  },
  {
    name: "BASES",
    url: "https://www.basesmi.org",
    logo: "/images/sponsors/Bases_Logo_for_Web_1024x252_be32d56fbe.png",
  },
  {
    name: "Blarney Castle",
    url: "https://blarneycastleoil.com/",
    logo: "/images/sponsors/BCOP_EZMART_LOGO_color_e170272370.jpg",
  },
]

export function formatDateRange(from: string, to: string) {
  const parse = (s: string) =>
    s.includes("T") ? new Date(s) : new Date(s + "T12:00:00")
  const f = parse(from)
  const t = parse(to)
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  const sameMonth = f.getMonth() === t.getMonth()
  if (sameMonth) {
    return `${f.toLocaleDateString("en-US", { month: "long", day: "numeric" })}–${t.getDate()}, ${t.getFullYear()}`
  }
  return `${f.toLocaleDateString("en-US", opts)} – ${t.toLocaleDateString("en-US", opts)}, ${t.getFullYear()}`
}

export function tournamentStatus(
  t: ApiTournament,
  now = new Date()
): TournamentStatus {
  if (new Date(t.date_to).getTime() < now.getTime()) return "completed"
  const paid = t.teams.filter((x) => x.isPaid).length
  const total = spotsTotalFor(t)
  if (paid >= total && total > 0) return "full"
  return "open"
}

export function canRegister(t: ApiTournament, now = new Date()): boolean {
  const status = tournamentStatus(t, now)
  return status === "open" || status === "filling"
}

export function spotsTotalFor(t: ApiTournament): number {
  // Try "LIMIT OF 5 TEAMS" in content, else State Finals default 8, else max(5, roster size)
  const text = `${t.content ?? ""} ${t.meta_description ?? ""}`
  const m = text.match(/limit of\s+(\d+)\s+teams?/i)
  if (m) return parseInt(m[1], 10)
  if (/state finals/i.test(t.name)) return Math.max(8, t.teams.length)
  return Math.max(5, t.teams.length || 5)
}

export function spotsLeftFor(t: ApiTournament): number {
  const paid = t.teams.filter((x) => x.isPaid).length
  return Math.max(0, spotsTotalFor(t) - paid)
}

export function statusLabel(s: TournamentStatus) {
  switch (s) {
    case "open":
      return "Registration open"
    case "filling":
      return "Filling fast"
    case "full":
      return "Tournament full"
    case "closed":
      return "Registration closed"
    case "completed":
      return "Completed"
  }
}

export function isCompleted(t: ApiTournament, now = new Date()): boolean {
  return new Date(t.date_to).getTime() < now.getTime()
}

/** Tournaments whose play window has not ended, soonest first. */
export function upcomingTournaments(
  list: ApiTournament[],
  now = new Date()
): ApiTournament[] {
  return list
    .filter((t) => !isCompleted(t, now))
    .sort(
      (a, b) =>
        new Date(a.date_from).getTime() - new Date(b.date_from).getTime()
    )
}

/** Most recently finished tournament (by end date). */
export function latestCompleted(
  list: ApiTournament[],
  now = new Date()
): ApiTournament | undefined {
  return list
    .filter((t) => isCompleted(t, now))
    .sort(
      (a, b) => new Date(b.date_to).getTime() - new Date(a.date_to).getTime()
    )[0]
}

export function totalTeams(list: ApiTournament[]): number {
  return list.reduce((sum, t) => sum + t.teams.length, 0)
}
