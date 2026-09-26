export const HALL_OF_FAME_API = "https://api.d21softball.org/hall-of-fame"

export interface HallOfFameMember {
  id: number
  name: string
  position: string
  location: string
  year: number
  biography: string[]
  articleUrl?: string
  mediaUrl?: string
}
export interface HallOfFamePhoto {
  src: string
  caption: string
  width?: number
  height?: number
}
export interface HallOfFameData {
  members: HallOfFameMember[]
  photos: HallOfFamePhoto[]
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid Hall of Fame response")
  return value as Record<string, unknown>
}
function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}
export function safePublicUrl(value: unknown): string | undefined {
  if (!text(value)) return undefined
  try {
    const url = new URL(text(value), HALL_OF_FAME_API)
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}
// Render legacy CMS biographies as React text, never inject upstream HTML/styles.
export function biographyParagraphs(value: unknown): string[] {
  const entities: Record<string, string> = {
    nbsp: " ",
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    ndash: "–",
    mdash: "—",
    rsquo: "’",
    lsquo: "‘",
    rdquo: "”",
    ldquo: "“",
  }
  return text(value)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?\s*>|<\/?(?:p|h[1-6]|li|ul|ol|div)\b[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
      if (!code.startsWith("#")) return entities[code.toLowerCase()] ?? entity
      const point =
        code[1].toLowerCase() === "x"
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10)
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : ""
    })
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
}
export function parseHallOfFame(value: unknown): HallOfFameData {
  const data = record(value)
  const table = record(data.table)
  if (!Array.isArray(table.member))
    throw new Error("Missing Hall of Fame members")
  const ids = new Set<number>()
  const members = table.member.map((value): HallOfFameMember => {
    const member = record(value)
    const year = Number(member.year)
    if (
      typeof member.id !== "number" ||
      ids.has(member.id) ||
      !text(member.name) ||
      !Number.isInteger(year) ||
      year < 1900 ||
      year > 9999
    )
      throw new Error("Invalid Hall of Fame member")
    ids.add(member.id)
    return {
      id: member.id,
      name: text(member.name),
      position: text(member.position) || "Unspecified",
      location: text(member.location) || "Not listed",
      year,
      biography: biographyParagraphs(member.summary),
      articleUrl: safePublicUrl(member.url),
      mediaUrl: member.media
        ? safePublicUrl(record(member.media).url)
        : undefined,
    }
  })
  const photos = (
    Array.isArray(data.image_carousel) ? data.image_carousel : []
  ).flatMap((value): HallOfFamePhoto[] => {
    const photo = record(value)
    const src = safePublicUrl(photo.url)
    return src
      ? [
          {
            src,
            caption:
              text(photo.caption) ||
              text(photo.alternativeText) ||
              "District 21 Hall of Fame",
            width:
              typeof photo.width === "number" && photo.width > 0
                ? photo.width
                : undefined,
            height:
              typeof photo.height === "number" && photo.height > 0
                ? photo.height
                : undefined,
          },
        ]
      : []
  })
  return { members, photos }
}
export type MemberSort = "newest" | "oldest" | "name"
export function filterMembers(
  members: HallOfFameMember[],
  search: string,
  category: string,
  sort: MemberSort
) {
  const terms = search.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  return members
    .filter((member) => {
      const haystack =
        `${member.name} ${member.position} ${member.location} ${member.year}`.toLocaleLowerCase()
      return (
        (category === "all" || member.position === category) &&
        terms.every((term) => haystack.includes(term))
      )
    })
    .sort((a, b) => {
      const byName = a.name.localeCompare(b.name)
      return sort === "name"
        ? byName
        : (sort === "oldest" ? a.year - b.year : b.year - a.year) || byName
    })
}
