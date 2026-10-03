import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  formatDateRange,
  spotsLeftFor,
  spotsTotalFor,
  statusLabel,
  tournamentStatus,
} from "@/lib/data"
import type { TournamentStatus } from "@/lib/data"
import type { ApiTournament } from "@/lib/tournaments"
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
  ChevronRight,
} from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Breadcrumbs({
  items,
  tone = "light",
}: {
  /** Trail segments: links for parents, plain text for the current page (last item). */
  items: ReactNode[]
  tone?: "dark" | "light"
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={cn(
          "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm",
          tone === "dark" ? "text-white/60" : "text-muted-foreground"
        )}
      >
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  aria-hidden="true"
                  className={cn(
                    "size-3.5 shrink-0",
                    tone === "dark"
                      ? "text-white/30"
                      : "text-muted-foreground/50"
                  )}
                />
              )}
              {last ? (
                <span
                  aria-current="page"
                  className={cn(
                    "max-w-[40ch] truncate font-medium",
                    tone === "dark" ? "text-white" : "text-foreground"
                  )}
                >
                  {item}
                </span>
              ) : (
                item
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function StatusBadge({ status }: { status: TournamentStatus }) {
  const tone =
    status === "open"
      ? "bg-emerald-600 text-white"
      : status === "filling"
        ? "bg-amber-500 text-black"
        : status === "completed"
          ? "bg-slate-600 text-white"
          : "bg-secondary text-secondary-foreground"
  return (
    <Badge className={cn("font-semibold", tone)}>{statusLabel(status)}</Badge>
  )
}

export function TournamentCard({ t }: { t: ApiTournament }) {
  const status = tournamentStatus(t)
  const completed = status === "completed"
  const left = spotsLeftFor(t)
  const total = spotsTotalFor(t)
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="bg-[var(--navy)] px-5 pt-5 pb-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={status} />
          <span className="font-condensed text-xs tracking-[0.18em] text-white/60 uppercase">
            {t.class}
          </span>
        </div>
        <h3 className="mt-3 font-display text-2xl leading-tight font-semibold tracking-wide uppercase">
          {t.name}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-white/75">
          <CalendarDays className="size-4" />{" "}
          {formatDateRange(t.date_from, t.date_to)}
        </p>
      </div>
      <CardHeader className="pb-2">
        <p className="text-sm font-medium">
          {t.meta_description ?? t.meta_title ?? ""}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> {t.location}
        </p>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm">
        {completed ? (
          <span className="text-muted-foreground">
            {t.teams.length} teams listed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4" /> {left} of {total} spots left
          </span>
        )}
        <span className="font-display text-xl font-semibold">
          {t.price ? `$${t.price}` : "TBD"}
        </span>
      </CardContent>
      <CardFooter className="mt-auto flex gap-2">
        {completed ? (
          <Link
            to="/tournaments/$slug"
            params={{ slug: t.slug }}
            className="flex-1"
          >
            <Button className="w-full">
              {t.bracketResults || t.finalBracket || t.resultsMedia.length
                ? "Brackets & results"
                : "Details"}{" "}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        ) : (
          <>
            <Link
              to="/tournaments/$slug"
              params={{ slug: t.slug }}
              className="flex-1"
            >
              <Button variant="outline" className="w-full">
                Details
              </Button>
            </Link>
            <Link
              to="/register"
              search={{ tournament: t.slug }}
              className="flex-1"
            >
              <Button
                className="w-full"
                disabled={status === "closed" || status === "full"}
              >
                Register <ArrowRight className="size-4" />
              </Button>
            </Link>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

export function SectionHeading({
  kicker,
  title,
  lede,
}: {
  kicker: string
  title: string
  lede?: string
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-condensed text-xs font-semibold tracking-[0.22em] text-primary uppercase">
        {kicker}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-wide uppercase sm:text-4xl">
        {title}
      </h1>
      {lede && (
        <p className="mt-3 leading-relaxed text-muted-foreground">{lede}</p>
      )}
    </div>
  )
}
