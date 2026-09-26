import { createServerFn } from "@tanstack/react-start"
import { queryOptions } from "@tanstack/react-query"
import { HALL_OF_FAME_API, parseHallOfFame } from "./hall-of-fame-data"

// Server-side fetching avoids the upstream API's browser CORS restrictions.
export const getHallOfFame = createServerFn({ method: "GET" }).handler(
  async () => {
    const response = await fetch(HALL_OF_FAME_API, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok)
      throw new Error(`Hall of Fame request failed: ${response.status}`)
    return parseHallOfFame(await response.json())
  }
)
export const hallOfFameQueryOptions = queryOptions({
  queryKey: ["hall-of-fame"],
  queryFn: () => getHallOfFame(),
  staleTime: 5 * 60 * 1000,
  retry: false,
})
