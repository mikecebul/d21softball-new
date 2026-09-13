import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading, StatusBadge } from "@/components/shared";
import {
  archiveResults,
  formatDateRange,
  homeUpdates,
  isCompleted,
  latestCompleted,
  SEASON_YEAR,
  spotsLeftFor,
  spotsTotalFor,
  totalTeams,
  tournamentStatus,
  upcomingTournaments,
} from "@/lib/data";
import { fetchSeasonTournaments } from "@/lib/tournaments";
import type { ApiTournament } from "@/lib/tournaments";
import {
  ArrowRight,
  CalendarDays,
  Landmark,
  MapPin,
  Megaphone,
  Share2,
  Sunset,
  Trophy,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/")({
  loader: () => fetchSeasonTournaments(SEASON_YEAR),
  component: HomePage,
});

function shortDate(t: ApiTournament) {
  const f = new Date(t.date_from);
  const to = new Date(t.date_to);
  const month = f.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const sameMonth = f.getUTCMonth() === to.getUTCMonth();
  return sameMonth
    ? `${month} ${f.getUTCDate()}–${to.getUTCDate()}`
    : `${month} ${f.getUTCDate()} – ${to.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })} ${to.getUTCDate()}`;
}

function championFor(t: ApiTournament) {
  return archiveResults.find((a) => a.slug === t.slug)?.champion;
}

function HomePage() {
  const tournaments = Route.useLoaderData();
  const season = [...tournaments].sort(
    (a, b) => new Date(a.date_from).getTime() - new Date(b.date_from).getTime(),
  );
  const upcoming = upcomingTournaments(tournaments);
  const seasonOver = upcoming.length === 0;
  // Prefer the most recent completed weekend that actually had teams in the field
  const featured: ApiTournament | undefined = seasonOver
    ? (latestCompleted(tournaments.filter((t) => t.teams.length > 0)) ??
      latestCompleted(tournaments))
    : upcoming[0];
  const featuredPaid = featured?.teams.filter((x) => x.isPaid).length ?? 0;
  const featuredTotal = featured ? spotsTotalFor(featured) : 0;
  const champion = featured ? championFor(featured) : undefined;
  const recentChampions = archiveResults.filter((a) => a.champion).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[var(--navy-deep)] text-white">
        <img
          src="https://api.d21softball.org/uploads/Sunset_at_Waterfront_c7cb630f90.webp"
          alt="Sunset over Little Traverse Bay at Waterfront Park, Petoskey"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy-deep)] via-[var(--navy-deep)]/85 to-[var(--navy-deep)]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-deep)] via-transparent to-[var(--navy-deep)]/50" />
        <div className="relative">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-16 pb-12 sm:pt-20 lg:grid-cols-[1.5fr_auto] lg:items-center lg:pt-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 font-condensed text-xs tracking-[0.2em] uppercase">
                <Sunset className="size-4" /> {SEASON_YEAR} season — Petoskey, Michigan
              </p>
              <h1 className="font-display mt-5 max-w-3xl text-5xl leading-[0.95] font-semibold tracking-wide text-balance uppercase sm:text-6xl lg:text-7xl">
                Fastpitch on the waterfront<span className="text-[var(--gold)]">.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
                Men's fastpitch tournaments at Waterfront Park — Little Traverse
                Bay behind the outfield fence, five-team round robins, and some
                of the best sunsets in softball.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {seasonOver ? (
                  <>
                    <Link to="/archives">
                      <Button size="lg" className="font-semibold">
                        View tournament results <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                    <Link to="/tournaments">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/25 bg-transparent font-semibold text-white hover:bg-white/10 hover:text-white"
                      >
                        The {SEASON_YEAR} slate
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" className="font-semibold">
                        Register for a tournament <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                    <Link to="/tournaments">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/25 bg-transparent font-semibold text-white hover:bg-white/10 hover:text-white"
                      >
                        See the {SEASON_YEAR} slate
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* scoreboard card — next up, or the season final */}
            {featured && (
              <aside className="overflow-hidden rounded-2xl border border-white/15 bg-[var(--navy)]/85 shadow-xl backdrop-blur-[2px]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-condensed text-[11px] tracking-[0.26em] text-white/60 uppercase">
                  <span>{seasonOver ? "Final" : "Next up"}</span>
                  <span className="inline-flex items-center gap-2 text-[var(--gold)]">
                    <span className="size-1.5 rounded-full bg-[var(--gold)]" />
                    {seasonOver ? "Season in the books" : "On the board"}
                  </span>
                </div>
                <div className="px-5 py-5">
                  <p className="font-condensed text-[11px] tracking-[0.2em] text-white/55 uppercase">
                    {featured.class}
                  </p>
                  <p className="font-display mt-1 text-2xl leading-tight font-semibold uppercase">
                    {featured.name}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-white/75">
                    <CalendarDays className="size-4 opacity-70" />
                    {formatDateRange(featured.date_from, featured.date_to)}
                  </p>
                  {seasonOver ? (
                    <p className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-sm">
                      <Trophy className="size-4 text-[var(--gold)]" />
                      {champion ? (
                        <span>
                          Champion — <strong>{champion}</strong>
                        </span>
                      ) : (
                        <span className="text-white/70">
                          {featured.teams.length} teams competed
                        </span>
                      )}
                    </p>
                  ) : (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <div className="mb-2 flex justify-between text-xs text-white/65">
                        <span>
                          {featuredPaid} of {featuredTotal} spots filled
                        </span>
                        <span className="tnum">{featured.price ? `$${featured.price}` : "TBD"}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/12">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[#f0c14b]"
                          style={{ width: `${featuredTotal ? Math.max(6, (featuredPaid / featuredTotal) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <Link
                    to="/tournaments/$slug"
                    params={{ slug: featured.slug }}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold)] hover:underline"
                  >
                    {seasonOver ? "View results" : "Tournament details"}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section
        aria-label={`${SEASON_YEAR} season at a glance`}
        className="texture-lines border-t border-[var(--gold)]/50 bg-[var(--navy-deep)] text-white"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
          {[
            [Trophy, `${season.length}`, "tournament weekends"],
            [Users, `${totalTeams(tournaments)}`, "teams took the field"],
            [MapPin, "1", "bay view ballpark"],
            [Landmark, "60+", "years at the waterfront"],
          ].map(([Icon, n, l]) => {
            const I = Icon as typeof Trophy;
            return (
              <div key={l as string} className="bg-[var(--navy-deep)] px-6 py-7">
                <I className="size-5 text-white/50" />
                <p className="font-display mt-2 text-3xl leading-none font-semibold">
                  {n as string}
                </p>
                <p className="font-condensed mt-1.5 text-[11px] tracking-[0.18em] text-white/60 uppercase">
                  {l as string}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SEASON LIST — every weekend, one scannable row each */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            kicker={`${SEASON_YEAR} season`}
            title="Every weekend, one park"
            lede="All tourneys are fast pitch at Waterfront Park. Pick a weekend for the full story — teams, brackets and results live on each tournament page."
          />
          <Link to="/tournaments">
            <Button variant="outline">
              All tournaments <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid gap-3">
          {season.map((t) => {
            const status = tournamentStatus(t);
            const completed = isCompleted(t);
            return (
              <Link
                key={t.slug}
                to="/tournaments/$slug"
                params={{ slug: t.slug }}
                className="group grid gap-2 rounded-xl border bg-card p-4 transition hover:border-foreground/30 hover:shadow-md sm:grid-cols-[6.5rem_1fr_auto] sm:items-center sm:gap-5 sm:p-5"
              >
                <p className="font-display text-sm font-semibold tracking-wide text-muted-foreground uppercase group-hover:text-foreground">
                  {shortDate(t)}
                </p>
                <div className="min-w-0">
                  <p className="font-display text-lg leading-tight font-semibold tracking-wide uppercase">
                    {t.name}
                  </p>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {t.class} · {t.location}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <StatusBadge status={status} />
                  <span className="font-display text-lg font-semibold">
                    {t.price ? `$${t.price}` : "TBD"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {completed ? "Results" : `${spotsLeftFor(t)} spots left`}
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* COMMISSIONER UPDATES */}
      <section
        id="updates"
        className="border-y bg-[var(--sand)]/40 scroll-mt-32"
      >
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHeading kicker="From the commissioner" title="News & updates" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {homeUpdates.map((u) => (
              <Card key={u.title}>
                <CardContent className="py-6">
                  <p className="font-semibold">{u.title}</p>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {u.body}
                  </p>
                  <a
                    href={u.link}
                    target={u.link.startsWith("http") ? "_blank" : undefined}
                    rel={u.link.startsWith("http") ? "noreferrer" : undefined}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    {u.link.startsWith("http") ? (
                      <>
                        <Share2 className="size-4" /> Open the Facebook group
                      </>
                    ) : (
                      <>
                        Learn more <ArrowRight className="size-4" />
                      </>
                    )}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-muted-foreground mt-8 flex max-w-3xl flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-relaxed">
            <Megaphone className="size-4 shrink-0" />
            Welcome to another season of fast pitch softball at the waterfront in
            Petoskey! Follow game scores, scorebook photos and champion galleries
            on "D21 Softball at Petoskey" — and plan to stay the week: local
            men's league plays Tuesday/Thursday, women's league
            Monday/Wednesday, mid-June into early August. — Scott
          </p>
        </div>
      </section>

      {/* RECENT CHAMPIONS */}
      <section className="texture-lines bg-[var(--navy-deep)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              kicker="The record book"
              title="Recent champions"
            />
            <div className="flex gap-6">
              <Link
                to="/archives"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--gold)] hover:underline"
              >
                Full archives <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/hall-of-fame"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--gold)] hover:underline"
              >
                Hall of Fame <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-white/12 bg-white/12 sm:grid-cols-2 lg:grid-cols-4">
            {recentChampions.map((a) => (
              <div key={a.slug} className="bg-[var(--navy-deep)] p-5">
                <p className="font-display text-3xl leading-none font-bold text-[var(--gold)]">
                  {a.year}
                </p>
                <p className="font-display mt-3 text-base leading-tight font-semibold uppercase">
                  {a.champion}
                </p>
                <p className="mt-1.5 text-xs text-white/60">
                  {a.name} · {a.class}
                </p>
                {a.runnerUp && (
                  <p className="font-condensed mt-2.5 text-[11px] tracking-[0.14em] text-white/40 uppercase">
                    Runner-up — {a.runnerUp}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT */}
      <section className="relative overflow-hidden text-white">
        <img
          src="https://api.d21softball.org/uploads/Sunset_at_Waterfront_b9fb47481b.jpg"
          alt="Sunset over Little Traverse Bay"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy-deep)]/90 via-[var(--navy-deep)]/60 to-[var(--navy-deep)]/90" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-[1.4fr_auto] lg:items-center lg:py-20">
          <div>
            <h2 className="font-display text-4xl leading-tight font-semibold tracking-wide uppercase sm:text-5xl">
              Stay the week <span className="text-[var(--gold)]">on the bay.</span>
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-white/80">
              Petoskey is a vacation town with a ballpark in it — beaches,
              breweries, and Little Traverse Bay along the water. Lodging,
              fuel stops and local league schedules are all here.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <Link to="/visit">
              <Button size="lg" className="font-semibold">
                Plan your visit <ArrowRight className="size-4" />
              </Button>
            </Link>
            <p className="font-condensed text-xs tracking-[0.18em] text-white/65 uppercase">
              Lodging &amp; motels · Fuel · Local leagues
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
