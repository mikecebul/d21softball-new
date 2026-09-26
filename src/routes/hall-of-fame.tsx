import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { HallOfFameGallery } from "@/components/hall-of-fame-gallery"
import { HallOfFameDirectory } from "@/components/hall-of-fame-directory"
import { hallOfFameQueryOptions } from "@/lib/hall-of-fame"

export const Route = createFileRoute("/hall-of-fame")({
  loader: ({ context: { queryClient } }) =>
    queryClient.prefetchQuery(hallOfFameQueryOptions),
  pendingComponent: HallOfFameLoading,
  component: HOFPage,
})

function HallOfFameLoading() {
  return (
    <div
      className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12"
      aria-busy="true"
      aria-label="Loading Hall of Fame"
    >
      <Skeleton className="h-14 w-64" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-72 w-full" />
      <p role="status" className="text-sm text-muted-foreground">
        Loading the honor roll…
      </p>
    </div>
  )
}

function HOFPage() {
  const { data, isPending, isError, isFetching, refetch } = useQuery(
    hallOfFameQueryOptions
  )
  if (isPending) return <HallOfFameLoading />
  const years = data?.members.map((member) => member.year) ?? []
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col justify-between gap-6 border-b border-primary/20 pb-8 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <p className="font-condensed text-xs font-semibold tracking-[0.22em] text-primary uppercase">
            A legacy built together
          </p>
          <h1 className="mt-2 font-display text-5xl font-semibold tracking-wide uppercase sm:text-6xl">
            Hall of Fame
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            Celebrating the District 21 players, leaders and supporters whose
            contributions earned a place in Michigan softball history.
          </p>
          {data && (
            <a
              href="#honorees"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
            >
              Explore the honor roll{" "}
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
          )}
        </div>
        {!!years.length && (
          <dl className="flex shrink-0 gap-8 border-l-2 border-[var(--gold)] pl-5">
            <div>
              <dt className="text-xs text-muted-foreground uppercase">
                Honorees
              </dt>
              <dd className="mt-1 font-display text-4xl font-semibold text-primary">
                {years.length}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground uppercase">
                Induction years
              </dt>
              <dd className="mt-1 font-display text-4xl font-semibold text-primary">
                {Math.min(...years)}–{Math.max(...years)}
              </dd>
            </div>
          </dl>
        )}
      </div>
      {isError && (
        <Alert className="mt-8">
          <AlertCircle />
          <AlertTitle>
            {data
              ? "We couldn’t refresh the honor roll"
              : "The honor roll is temporarily unavailable"}
          </AlertTitle>
          <AlertDescription>
            <p>
              {data
                ? "You can still browse the last loaded member list."
                : "Please try again to load the Hall of Fame members and photographs."}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              {isFetching ? "Trying again…" : "Try again"}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {data && (
        <>
          <HallOfFameGallery photos={data.photos} />
          <HallOfFameDirectory members={data.members} />
        </>
      )}
    </div>
  )
}
