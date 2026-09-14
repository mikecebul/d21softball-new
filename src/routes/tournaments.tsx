import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useEffect, useRef, useState, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { SectionHeading, TournamentCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { FIRST_SEASON_YEAR, SEASON_YEAR, seasonYears } from "@/lib/data";
import { getSeasonTournaments } from "@/lib/tournaments";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tournaments")({
  validateSearch: (s: Record<string, unknown>): { year?: number } => {
    const raw = s.year;
    const y =
      typeof raw === "string" ? Number.parseInt(raw, 10) : typeof raw === "number" ? raw : undefined;
    return {
      year:
        y !== undefined &&
        Number.isInteger(y) &&
        y >= FIRST_SEASON_YEAR &&
        y <= SEASON_YEAR
          ? y
          : undefined,
    };
  },
  loaderDeps: ({ search }) => ({ year: search.year ?? SEASON_YEAR }),
  loader: async ({ deps: { year }, context: { queryClient } }) => {
    // Server-side fetch through a server function — the browser never talks to
    // the upstream API, so its CORS policy can't affect us.
    await queryClient.ensureQueryData({
      queryKey: ["season", year],
      queryFn: () => getSeasonTournaments({ data: { year } }),
    });
  },
  component: TournamentsPage,
});

function TournamentsPage() {
  const { year: yearParam } = Route.useSearch();
  const resolvedYear = yearParam ?? SEASON_YEAR;

  // Optimistic year: set the moment a pill/arrow is clicked so the UI targets
  // the new season immediately; TanStack Query supplies the data (cached per
  // year on both server and client) and reports loading state reactively.
  const [optimisticYear, setOptimisticYear] = useState<number | null>(null);
  useEffect(() => {
    setOptimisticYear(null);
  }, [resolvedYear]);

  const clickYear = (y: number) => setOptimisticYear(y);

  const slugMatch = useMatch({ from: "/tournaments/$slug", shouldThrow: false });
  if (slugMatch) return <Outlet />;

  const year = optimisticYear ?? resolvedYear;
  const years = seasonYears();
  const { data: season } = useQuery({
    queryKey: ["season", year],
    queryFn: () => getSeasonTournaments({ data: { year } }),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        kicker={year === SEASON_YEAR ? `Summer ${year}` : `${year} season`}
        title={year === SEASON_YEAR ? "Tournaments" : `${year} tournaments`}
        lede={
          year === SEASON_YEAR
            ? "All tourneys are fastpitch at Waterfront Park, Petoskey MI — five-team round robins, Friday night to Sunday championship."
            : `Final results and champions from the ${year} season at Waterfront Park, Petoskey MI.`
        }
      />

      {/* season filter — one scrollable row of year pills */}
      <SeasonFilter years={years} year={year} onYearClick={clickYear} />

      {season === undefined ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading tournaments">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="overflow-hidden rounded-xl border bg-card">
              <Skeleton className="h-30 w-full rounded-none" />
              <div className="grid gap-2.5 p-5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="mt-3 h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : season.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-sm">No tournaments posted for this season yet — check back soon.</p>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {season.map((t) => (
            <TournamentCard key={t.slug} t={t} />
          ))}
        </div>
      )}

      {/* season pagination — one step older/newer */}
      <SeasonPagination years={years} year={year} onYearClick={clickYear} />

      {resolvedYear === SEASON_YEAR && (
        <div className="mt-10 rounded-xl border bg-card p-6 text-sm leading-relaxed">
          <p className="font-semibold">Good to know</p>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5">
            <li>Entry fees are per team, paid once via Stripe checkout.</li>
            <li>Paid teams are locked to the roster name — contact the commissioner for swaps.</li>
            <li>Brackets and final results post to each tournament page once play begins.</li>
            <li>Questions? scott@d21softball.org — (231) 547-1144.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

function seasonLink(y: number) {
  return {
    to: "/tournaments" as const,
    search: y === SEASON_YEAR ? {} : { year: y },
  };
}

function SeasonFilter({
  years,
  year,
  onYearClick,
}: {
  years: number[];
  year: number;
  onYearClick: (y: number) => void;
}) {
  const activeYearRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const firstRun = useRef(true);

  const idx = years.indexOf(year);
  const newer = idx > 0 ? years[idx - 1] : undefined;
  const older = idx !== -1 && idx < years.length - 1 ? years[idx + 1] : undefined;

  /** Center `el` in the rail, animating scrollLeft like a manual scroll. */
  const slideTo = (el: HTMLElement, instant = false) => {
    const rail = railRef.current;
    if (!rail) return;
    const railRect = rail.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const target =
      rail.scrollLeft + (elRect.left + elRect.width / 2 - (railRect.left + railRect.width / 2));
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (instant || reduce) {
      rail.scrollLeft = target;
      return;
    }
    const start = rail.scrollLeft;
    const dist = target - start;
    if (Math.abs(dist) < 1) return;
    const duration = 550;
    const t0 = performance.now();
    // easeInOutCubic
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      rail.scrollLeft = start + dist * ease(p);
      animRef.current = p < 1 ? requestAnimationFrame(step) : null;
    };
    animRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const center = (el: HTMLElement | null) => {
      if (!el) return;
      const railRect = rail.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      rail.scrollLeft +=
        elRect.left + elRect.width / 2 - (railRect.left + railRect.width / 2);
    };
    if (firstRun.current) {
      firstRun.current = false;
      center(activeYearRef.current);
    } else if (activeYearRef.current) {
      slideTo(activeYearRef.current);
    }
    // Re-center on resize, but never stomp an in-flight slide animation.
    const ro = new ResizeObserver(() => {
      if (animRef.current === null) center(activeYearRef.current);
    });
    ro.observe(rail);
    return () => {
      ro.disconnect();
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [year]);

  const stepperClass =
    "size-9 border-white/25 bg-transparent text-white/80 hover:bg-white/10 hover:text-white";

  return (
    <div className="mt-8 rounded-xl bg-[var(--navy)] p-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="font-condensed shrink-0 pl-1 text-xs font-semibold tracking-[0.22em] text-[var(--gold)] uppercase">
          Season
        </span>

        {/* newer — far left; arrows follow the rail order (2026 … 2003) */}
        {newer ? (
          <Link {...seasonLink(newer)} preload="intent" aria-label={`Go to ${newer} season`}>
            <Button
              variant="outline"
              size="icon"
              className={stepperClass}
              onClick={() => onYearClick(newer)}
            >
              <ChevronLeft />
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            size="icon"
            disabled
            className={stepperClass}
            aria-label="No newer season"
          >
            <ChevronLeft />
          </Button>
        )}

        {/* year pill rail */}
        <div className="relative min-w-0 flex-1">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[var(--navy)] to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[var(--navy)] to-transparent"
          />
          <div
            ref={railRef}
            className="flex items-center gap-1.5 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {years.map((y) => {
              const active = y === year;
              return (
                <span key={y} ref={active ? activeYearRef : undefined} className="shrink-0">
                  <Link {...seasonLink(y)}>
                    <Button
                      onClick={() => onYearClick(y)}
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className={cn(
                        "font-condensed rounded-full px-3.5 text-sm tracking-wide",
                        active
                          ? "text-white"
                          : "border-white/25 bg-transparent text-white/75 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      {y}
                    </Button>
                  </Link>
                </span>
              );
            })}
          </div>
        </div>

        {/* older — far right */}
        {older ? (
          <Link {...seasonLink(older)} preload="intent" aria-label={`Go to ${older} season`}>
            <Button
              variant="outline"
              size="icon"
              className={stepperClass}
              onClick={() => onYearClick(older)}
            >
              <ChevronRight />
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            size="icon"
            disabled
            className={stepperClass}
            aria-label="No older season"
          >
            <ChevronRight />
          </Button>
        )}
      </div>
    </div>
  );
}

function SeasonPagination({
  years,
  year,
  onYearClick,
}: {
  years: number[];
  year: number;
  onYearClick: (y: number) => void;
}) {
  const idx = years.indexOf(year);
  const newer = idx > 0 ? years[idx - 1] : undefined;
  const older = idx !== -1 && idx < years.length - 1 ? years[idx + 1] : undefined;

  // Window of chips: newest, oldest, current ±1 — pad with a second neighbor at the ends.
  const picks = new Set<number>([years[0], years[years.length - 1], year]);
  if (newer !== undefined) picks.add(newer);
  else if (idx !== -1 && idx + 2 < years.length) picks.add(years[idx + 2]);
  if (older !== undefined) picks.add(older);
  else if (idx > 1) picks.add(years[idx - 2]);
  const chips = years.filter((y) => picks.has(y));

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        {newer && (
          <PaginationItem>
            <Link {...seasonLink(newer)} preload="intent" aria-label={`Go to ${newer} season`}>
              <Button variant="ghost" size="icon" onClick={() => onYearClick(newer)}>
                <ChevronLeft />
              </Button>
            </Link>
          </PaginationItem>
        )}
        {chips.map((y, i) => (
          <Fragment key={y}>
            {i > 0 && chips[i - 1] - y > 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              {y === year ? (
                <Button
                  variant="outline"
                  aria-current="page"
                  tabIndex={-1}
                  className="font-condensed pointer-events-none min-w-10 px-2"
                >
                  {shortYear(y)}
                </Button>
              ) : (
                <Link {...seasonLink(y)} preload="intent">
                  <Button
                    variant="ghost"
                    onClick={() => onYearClick(y)}
                    className="font-condensed text-muted-foreground min-w-10 px-2"
                  >
                    {shortYear(y)}
                  </Button>
                </Link>
              )}
            </PaginationItem>
          </Fragment>
        ))}
        {older && (
          <PaginationItem>
            <Link {...seasonLink(older)} preload="intent" aria-label={`Go to ${older} season`}>
              <Button variant="ghost" size="icon" onClick={() => onYearClick(older)}>
                <ChevronRight />
              </Button>
            </Link>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

function shortYear(y: number) {
  return `${String(y).slice(2)}'`;
}
