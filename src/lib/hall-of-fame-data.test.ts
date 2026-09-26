import { describe, expect, it } from "vitest"
import {
  biographyParagraphs,
  filterMembers,
  parseHallOfFame,
  safePublicUrl,
} from "./hall-of-fame-data"

const payload = {
  table: {
    member: [
      {
        id: 1,
        name: "Ed White",
        position: "Commissioner",
        location: "Petoskey",
        year: "1991",
        summary: null,
        url: null,
        media: null,
      },
      {
        id: 2,
        name: "Adam Lalonde",
        position: "Player",
        location: "Cheboygan",
        year: "2022",
        summary: "<p>Career &amp; awards</p><ul><li>Gold medal</li></ul>",
        url: "https://example.com/story",
        media: null,
      },
      {
        id: 3,
        name: "Duke Vander Ark",
        position: "Player",
        location: "Grand Rapids",
        year: "2022",
        summary: null,
      },
    ],
  },
  image_carousel: [
    {
      url: "/uploads/banquet.jpg",
      caption: "Banquet",
      width: 1000,
      height: 500,
    },
  ],
}

describe("Hall of Fame API adapter", () => {
  it("preserves all members, normalizes years and resolves media", () => {
    const data = parseHallOfFame(payload)
    expect(data.members).toHaveLength(3)
    expect(data.members[0]).toMatchObject({ year: 1991, biography: [] })
    expect(data.members[1].biography).toEqual(["Career & awards", "Gold medal"])
    expect(data.photos[0].src).toBe(
      "https://api.d21softball.org/uploads/banquet.jpg"
    )
  })
  it("rejects malformed data instead of presenting a partial honor roll", () => {
    expect(() => parseHallOfFame({})).toThrow()
    expect(() =>
      parseHallOfFame({
        table: { member: [{ id: 1, name: "Test", year: "unknown" }] },
      })
    ).toThrow()
    expect(() =>
      parseHallOfFame({
        table: { member: [payload.table.member[0], payload.table.member[0]] },
      })
    ).toThrow()
    expect(parseHallOfFame({ table: { member: [] } })).toEqual({
      members: [],
      photos: [],
    })
  })
  it("handles legacy HTML and rejects executable links", () => {
    expect(
      biographyParagraphs(
        "<style>bad</style><script>alert(1)</script><p>Player&#39;s &quot;story&quot;</p><li>1991&nbsp;inductee</li>"
      )
    ).toEqual([`Player's "story"`, "1991 inductee"])
    expect(safePublicUrl("javascript:alert(1)")).toBeUndefined()
    expect(safePublicUrl("data:text/html,test")).toBeUndefined()
    expect(safePublicUrl(null)).toBeUndefined()
  })
})

describe("Honor roll search and sort", () => {
  const { members } = parseHallOfFame(payload)
  it("combines case-insensitive search across fields with the contribution filter", () => {
    expect(
      filterMembers(members, "  ADAM 2022 ", "Player", "newest").map(
        (m) => m.id
      )
    ).toEqual([2])
    expect(
      filterMembers(members, "petoskey", "all", "newest").map((m) => m.id)
    ).toEqual([1])
    expect(filterMembers(members, "petoskey", "Player", "newest")).toEqual([])
  })
  it("sorts numerically by year with stable name ordering and never mutates API data", () => {
    expect(
      filterMembers(members, "", "all", "newest").map((m) => m.id)
    ).toEqual([2, 3, 1])
    expect(
      filterMembers(members, "", "all", "oldest").map((m) => m.id)
    ).toEqual([1, 2, 3])
    expect(filterMembers(members, "", "all", "name").map((m) => m.id)).toEqual([
      2, 3, 1,
    ])
    expect(members.map((m) => m.id)).toEqual([1, 2, 3])
  })
})
