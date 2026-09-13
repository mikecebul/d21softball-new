import type { ApiTournament } from "./tournaments";

export type TournamentStatus = "open" | "filling" | "full" | "closed" | "completed";

export const SEASON_YEAR = 2026;

export interface ArchiveResult {
  slug: string;
  year: number;
  name: string;
  class: string;
  champion?: string;
  runnerUp?: string;
  dateLabel: string;
}

export const archiveYears = [2026, 2025, 2024, 2023, 2022, 2021, 2019, 2018, 2017, 2016];

export const archiveResults: ArchiveResult[] = [
  { slug: "ed-white-memorial-tournament-2026", year: 2026, name: "Ed White Memorial", class: "Men's D & E", champion: "Young Insulation", runnerUp: "Bay Sox", dateLabel: "Jun 19–21" },
  { slug: "dick-harbaugh-memorial-2026", year: 2026, name: "Dick Harbaugh Memorial", class: "Men's C & D", champion: "Northern Fire", runnerUp: "Motor City Hitmen", dateLabel: "Jun 26–28" },
  { slug: "2025-ed-white-memorial-tournament", year: 2025, name: "Ed White Memorial", class: "Men's D & E", champion: "Bay Sox", runnerUp: "Dekalb", dateLabel: "Jun 20–22" },
  { slug: "2025-dick-harbaugh-memorial", year: 2025, name: "Dick Harbaugh Memorial", class: "Men's C & D", champion: "Lakeshore Kings", runnerUp: "Bay Sox", dateLabel: "Jun 27–29" },
  { slug: "2025-dick-bare-memorial", year: 2025, name: "Dick Bare Memorial", class: "Men's D & E", champion: "Young Insulation", runnerUp: "Northern Fire", dateLabel: "Jul 11–13" },
  { slug: "2024-state-finals", year: 2024, name: "State Finals", class: "Men's B", champion: "Motor City Hitmen", runnerUp: "Traverse Nine", dateLabel: "Aug 23–25" },
  { slug: "2024-ed-white-memorial-tournament", year: 2024, name: "Ed White Memorial", class: "Men's D & E", champion: "Dekalb", runnerUp: "Bay Sox", dateLabel: "Jun 21–23" },
  { slug: "2024-rex-marquardt-memorial", year: 2024, name: "Rex Marquardt Memorial", class: "C & below / 50+", champion: "50 Caliber", runnerUp: "Harbor Springs", dateLabel: "Jul 5–7" },
  { slug: "2023-state-finals", year: 2023, name: "State Finals", class: "Men's C", champion: "Grand Rapids Nine", runnerUp: "Bay Sox", dateLabel: "Aug 18–20" },
  { slug: "2023-ed-white-memorial-tournament", year: 2023, name: "Ed White Memorial", class: "Men's D & E", champion: "Bradley Braves", runnerUp: "Young Insulation", dateLabel: "Jun 16–18" },
  { slug: "2022-ed-white-memorial-tournament", year: 2022, name: "Ed White Memorial", class: "Men's D & E", champion: "Bay Sox", runnerUp: "Bradley Braves", dateLabel: "Jun 17–19" },
  { slug: "2021-ed-white-memorial-tournament", year: 2021, name: "Ed White Memorial", class: "Men's D & E", champion: "Dekalb", runnerUp: "Dream Team", dateLabel: "Jun 18–20" },
];

export const sponsors = [
  { name: "Blarney Castle Oil & EZ Mart", url: "https://blarneycastleoil.com", blurb: "Fuel & convenience across Michigan" },
  { name: "Polaris Home Funding", url: "https://www.polarishfc.com", blurb: "Grand Rapids home lending" },
  { name: "DJS Systems", url: "https://d21softball.org", blurb: "Homer, MI" },
  { name: "BASES Charlevoix", url: "https://www.basesmi.org", blurb: "Community support" },
  { name: "Petoskey Area Visitors Bureau", url: "https://www.petoskeyarea.com", blurb: "Lodging & travel — PetoskeyArea.com" },
  { name: "USA Softball of Michigan", url: "https://www.usasoftballmi.org", blurb: "Sanctioning body" },
];

export const homeUpdates = [
  {
    title: "2026 State Championship trail",
    body: "Class D in Saginaw Jul 17–19 • Class E & C in Saginaw Jul 31–Aug 2 • Class B Finals in Petoskey Aug 21–23.",
    link: "/tournaments",
  },
  {
    title: "Pitcher classification list",
    body: "Check the current USA Softball of Michigan pitcher list before you register your roster.",
    link: "/rules",
  },
  {
    title: "Follow the scores live",
    body: "Game scores, scorebook photos and champion galleries post to “D21 Softball at Petoskey” on Facebook.",
    link: "https://www.facebook.com/groups/127657947314063",
  },
];

export const hallOfFame = [
  { name: "Ed White", position: "Commissioner", location: "Petoskey, MI", year: 2006, summary: "Coordinated waterfront tournaments for 30+ years. The waterfront ballpark bears his name." },
  { name: "Rex Marquardt", position: "Player / Builder", location: "Petoskey, MI", year: 2012, summary: "Honored by the July 4th-weekend memorial tournament for decades of fastpitch support." },
  { name: "Dick Harbaugh", position: "Coach", location: "Northern MI", year: 2014, summary: "Namesake of the late-June C/D memorial tournament." },
  { name: "Dick Bare", position: "Umpire / Builder", location: "Petoskey, MI", year: 2016, summary: "Recognition weekend namesake; decades behind the plate and on the grounds crew." },
  { name: "Ken Zulski", position: "Player", location: "Michigan", year: 2018, summary: "Longtime memorial invitational namesake." },
  { name: "Mary Lou Ingalls", position: "Builder", location: "Michigan", year: 2019, summary: "Women's memorial invitational namesake." },
];

export const localLeagues = [
  {
    name: "Men's Fastpitch League",
    nights: "Tuesday & Thursday nights",
    season: "Mid-June → early August",
    location: "Waterfront Park, Petoskey",
    contact: "Scott Kelly — scott@d21softball.org — (231) 547-1144",
  },
  {
    name: "Women's Fastpitch League",
    nights: "Monday & Wednesday nights",
    season: "Mid-June → early August",
    location: "Waterfront Park, Petoskey",
    contact: "Scott Kelly — scott@d21softball.org — (231) 547-1144",
  },
];

export function formatDateRange(from: string, to: string) {
  const parse = (s: string) => (s.includes("T") ? new Date(s) : new Date(s + "T12:00:00"));
  const f = parse(from);
  const t = parse(to);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const sameMonth = f.getMonth() === t.getMonth();
  if (sameMonth) {
    return `${f.toLocaleDateString("en-US", { month: "long", day: "numeric" })}–${t.getDate()}, ${t.getFullYear()}`;
  }
  return `${f.toLocaleDateString("en-US", opts)} – ${t.toLocaleDateString("en-US", opts)}, ${t.getFullYear()}`;
}

export function tournamentStatus(t: ApiTournament, now = new Date()): TournamentStatus {
  if (new Date(t.date_to).getTime() < now.getTime()) return "completed";
  const paid = t.teams.filter((x) => x.isPaid).length;
  const total = spotsTotalFor(t);
  if (paid >= total && total > 0) return "full";
  return "open";
}

export function spotsTotalFor(t: ApiTournament): number {
  // Try "LIMIT OF 5 TEAMS" in content, else State Finals default 8, else max(5, roster size)
  const text = `${t.content ?? ""} ${t.meta_description ?? ""}`;
  const m = text.match(/limit of\s+(\d+)\s+teams?/i);
  if (m) return parseInt(m[1], 10);
  if (/state finals/i.test(t.name)) return Math.max(8, t.teams.length);
  return Math.max(5, t.teams.length || 5);
}

export function spotsLeftFor(t: ApiTournament): number {
  const paid = t.teams.filter((x) => x.isPaid).length;
  return Math.max(0, spotsTotalFor(t) - paid);
}

export function statusLabel(s: TournamentStatus) {
  switch (s) {
    case "open":
      return "Registration open";
    case "filling":
      return "Filling fast";
    case "full":
      return "Waitlist";
    case "closed":
      return "Registration closed";
    case "completed":
      return "Completed";
  }
}
