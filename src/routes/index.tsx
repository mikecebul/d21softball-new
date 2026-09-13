import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SectionHeading, TournamentCard } from "@/components/shared"
import { homeUpdates, SEASON_YEAR, tournamentStatus } from "@/lib/data"
import { fetchSeasonTournaments } from "@/lib/tournaments"
import {
  ArrowRight,
  Trophy,
  Sunset,
  ClipboardList,
  CreditCard,
  MapPin,
  Megaphone,
} from "lucide-react"

export const Route = createFileRoute("/")({
  loader: () => fetchSeasonTournaments(SEASON_YEAR),
  component: HomePage,
})

const weekendSchedule = [
  { day: "Friday", detail: "Two games under the lights, first pitch 7:00 PM" },
  { day: "Saturday", detail: "Full slate from 9:00 AM — round robin all day" },
  {
    day: "Sunday",
    detail: "Final round-robin games from 8:00 AM, one-game final ~noon",
  },
]

function HomePage() {
  const tournaments = Route.useLoaderData();
  const upcoming = tournaments.filter((t) => {
    const s = tournamentStatus(t);
    return s === "open" || s === "filling";
  });
  const showcase = upcoming.length > 0 ? upcoming : tournaments;
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
        {/* fade the photo so the headline + CTA stay the focus */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy-deep)] via-[var(--navy-deep)]/85 to-[var(--navy-deep)]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-deep)] via-transparent to-[var(--navy-deep)]/50" />
        <div className="relative">
          <div className="mx-auto max-w-6xl px-4 pt-16 pb-10 lg:pt-24">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 font-condensed text-xs tracking-[0.2em] uppercase">
              <Sunset className="size-4" /> 2026 season — Petoskey, Michigan
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.95] font-semibold tracking-wide uppercase sm:text-6xl lg:text-7xl">
              Fastpitch on
              <br />
              the waterfront.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
              Five weekends of men's fastpitch at Waterfront Park — Little
              Traverse Bay behind the outfield fence, four-game guarantees, and
              some of the best sunsets in softball.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg" className="font-semibold">
                  Register your team <ArrowRight className="size-4" />
                </Button>
              </Link>
              <a href="#updates">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/25 bg-transparent font-semibold text-white hover:bg-white/10 hover:text-white"
                >
                  <Megaphone className="size-4" /> Latest from the commissioner
                </Button>
              </a>
            </div>
          </div>
          <div className="relative border-t border-white/15 bg-[var(--navy-deep)]/55 backdrop-blur-[2px]">
            <dl className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-5 sm:grid-cols-3">
              {[
                [Trophy, "5", "weekends"],
                [ClipboardList, "4-game", "guarantee"],
                [MapPin, "1", "bay view park"],
              ].map(([Icon, n, l]) => {
                const I = Icon as typeof Trophy
                return (
                  <div key={l as string} className="flex items-center gap-3">
                    <I className="size-5 shrink-0 text-white/60" />
                    <div>
                      <dt className="font-display text-2xl leading-none font-semibold">
                        {n as string}
                      </dt>
                      <dd className="font-condensed text-xs tracking-[0.18em] text-white/60 uppercase">
                        {l as string}
                      </dd>
                    </div>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>
      </section>

      {/* COMMISSIONER UPDATES — first so visitors see the latest news right away */}
      <section
        id="updates"
        className="mx-auto max-w-6xl scroll-mt-32 px-4 py-16"
      >
        <SectionHeading kicker="From the commissioner" title="News & updates" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {homeUpdates.map((u) => (
            <Card key={u.title}>
              <CardContent className="py-6">
                <p className="font-semibold">{u.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {u.body}
                </p>
                <Separator className="my-4" />
                <a
                  href={u.link}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  {u.link.startsWith("http") ? "Open link" : "Learn more"}{" "}
                  <ArrowRight className="size-4" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Welcome to another season of fast pitch softball at the waterfront in
          Petoskey! Follow game scores, scorebook photos and champion galleries
          on “D21 Softball at Petoskey” — and plan to stay the week: local men's
          league plays Tuesday/Thursday, women's league Monday/Wednesday,
          mid-June into early August. — Scott
        </p>
      </section>

      {/* UPCOMING */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            kicker={`${SEASON_YEAR} tournaments`}
            title="Pick your weekend"
            lede="All tourneys are fast pitch. Five-team round robins with a four-game guarantee — built for travel teams."
          />
          <Link to="/tournaments">
            <Button variant="outline">
              All tournaments <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {showcase.map((t) => (
            <TournamentCard key={t.slug} t={t} />
          ))}
          <Card className="border-dashed">
            <CardContent className="flex h-full flex-col items-start justify-center gap-3 py-8">
              <Trophy className="size-8 text-primary" />
              <p className="font-display text-2xl font-semibold uppercase">
                State finals trail
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Class D (Jul 17–19), Class E & C (Jul 31–Aug 2) in Saginaw.
                Class B Finals close the summer in Petoskey, Aug 21–23.
              </p>
              <Link to="/archives">
                <Button variant="link" className="px-0">
                  Past champions <ArrowRight className="size-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FORMAT */}
      <section className="border-y bg-[var(--sand)]/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2">
          <SectionHeading
            kicker="How weekends run"
            title="Built for travel ball"
            lede="The format hasn't changed because it works: guaranteed games, a Friday-to-Sunday arc you can plan a trip around, and brackets posted right here."
          />
          <div className="grid gap-3">
            {weekendSchedule.map((s, i) => (
              <div
                key={s.day}
                className="flex gap-4 rounded-xl border bg-card p-5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--navy)] font-display text-lg font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-lg font-semibold tracking-wide uppercase">
                    {s.day}
                  </p>
                  <p className="text-sm text-muted-foreground">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTER STEPS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHeading
          kicker="Registration"
          title="Three steps, then play ball"
          lede="No accounts, no dashboard. Pick a tournament, tell us about your team, check out with Stripe."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Trophy,
              t: "1 — Choose",
              d: "Pick your tournament and class. Spots are capped at 5–8 teams per weekend.",
            },
            {
              icon: ClipboardList,
              t: "2 — Team + contact",
              d: "Team name, hometown, manager contact, roster size and notes.",
            },
            {
              icon: CreditCard,
              t: "3 — Pay with Stripe",
              d: "Secure checkout. You'll land on a confirmation with your order details.",
            },
          ].map((s) => (
            <Card key={s.t}>
              <CardContent className="py-6">
                <s.icon className="size-7 text-primary" />
                <p className="mt-3 font-display text-xl font-semibold uppercase">
                  {s.t}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.d}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register">
            <Button size="lg" className="font-semibold">
              Start registration <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link to="/rules">
            <Button size="lg" variant="outline">
              Check eligibility & bats
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
