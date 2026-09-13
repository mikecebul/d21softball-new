export const TOURNAMENTS_API_BASE = "https://api.d21softball.org";

export interface ApiTeam {
  id: number;
  team: string;
  isPaid: boolean;
}

export interface ApiMedia {
  id: number;
  name: string;
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number | null;
  height?: number | null;
  mime?: string;
}

export interface ApiTournament {
  id: number;
  name: string;
  content: string | null;
  meta_description: string | null;
  meta_title: string | null;
  price: number | null;
  slug: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  date_from: string;
  date_to: string;
  class: string;
  location: string;
  bracketResults: string | null;
  teams: ApiTeam[];
  image: ApiMedia | null;
  finalBracket: ApiMedia | null;
  resultsMedia: ApiMedia[];
}

export function apiUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${TOURNAMENTS_API_BASE}${path}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseApiTeam(t: ApiTeam): { id: string; name: string; hometown: string; isPaid: boolean } {
  const raw = t.team.trim();
  // Format is usually "Team Name from Hometown" with optional "(note)"
  const match = raw.match(/^(.*?)\s+from\s+(.*)$/i);
  if (match) {
    return { id: String(t.id), name: match[1].trim(), hometown: match[2].trim(), isPaid: t.isPaid };
  }
  return { id: String(t.id), name: raw || "TBD", hometown: "", isPaid: t.isPaid };
}

export async function fetchTournaments(params?: { limit?: number; sort?: string }): Promise<ApiTournament[]> {
  const search = new URLSearchParams();
  if (params?.sort) search.set("_sort", params.sort);
  if (typeof params?.limit === "number") search.set("_limit", String(params.limit));
  const qs = search.toString();
  const url = `${TOURNAMENTS_API_BASE}/tournaments${qs ? `?${qs}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch tournaments: ${res.status}`);
  return (await res.json()) as ApiTournament[];
}

export async function fetchSeasonTournaments(year: number): Promise<ApiTournament[]> {
  // API has no year filter, pull everything (142 rows, ~2MB) sorted newest-first
  // then filter client-side. _limit=-1 disables Strapi pagination.
  const all = await fetchTournaments({ sort: "date_from:DESC", limit: -1 });
  return all.filter((t) => new Date(t.date_from).getUTCFullYear() === year);
}

export async function fetchTournamentBySlug(slug: string): Promise<ApiTournament | undefined> {
  const url = `${TOURNAMENTS_API_BASE}/tournaments?slug=${encodeURIComponent(slug)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch tournament ${slug}: ${res.status}`);
  const list = (await res.json()) as ApiTournament[];
  return list[0];
}

export function tournamentYear(t: ApiTournament): number {
  return new Date(t.date_from).getUTCFullYear();
}

export function tournamentDescriptionText(t: ApiTournament): string {
  if (!t.content) return t.meta_description ?? "";
  return stripHtml(t.content);
}
