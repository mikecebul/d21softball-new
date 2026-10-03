import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StatusBadge, Breadcrumbs } from "@/components/shared"
import {
  formatDateRange,
  SEASON_YEAR,
  spotsLeftFor,
  spotsTotalFor,
  tournamentStatus,
} from "@/lib/data"
import {
  apiUrl,
  getTournamentBySlug,
  parseApiTeam,
  tournamentDescriptionText,
  tournamentYear,
} from "@/lib/tournaments"
import { facebookUrl } from "@/lib/original-site-content"
import {
  ArrowRight,
  CalendarDays,
  Check,
  Download,
  MapPin,
  ExternalLink,
  Users,
} from "lucide-react"

export const Route = createFileRoute("/tournaments/$slug")({
  loader: async ({ params }) => {
    const t = await getTournamentBySlug({ data: { slug: params.slug } })
    if (!t) throw notFound()
    return t
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title:
          loaderData?.meta_title ||
          `${loaderData?.name ?? "Tournament"} — D21 Softball`,
      },
      {
        name: "description",
        content:
          loaderData?.meta_description ??
          "Tournament information, teams, brackets and results.",
      },
    ],
  }),
  component: TournamentDetailPage,
})

function TournamentDetailPage() {
  const t = Route.useLoaderData()

  const status = tournamentStatus(t)
  const total = spotsTotalFor(t)
  const left = spotsLeftFor(t)
  const teams = t.teams.map(parseApiTeam)
  const description = tournamentDescriptionText(t)
  const bracketUrl = apiUrl(t.finalBracket?.url)
  const hasResults = Boolean(t.bracketResults || bracketUrl)
  const year = tournamentYear(t)
  const imageUrl = apiUrl(t.image?.url)

  return (
    <div>
      {/* header band */}
      <div className="bg-[var(--navy-deep)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <Breadcrumbs
            tone="dark"
            items={[
              <Link
                key="tournaments"
                to="/tournaments"
                activeOptions={{ exact: true }}
                className="hover:text-white"
              >
                Tournaments
              </Link>,
              year === SEASON_YEAR ? (
                <span key="year">{year}</span>
              ) : (
                <Link
                  key="year"
                  to="/tournaments"
                  search={{ year }}
                  activeOptions={{ exact: true }}
                  className="hover:text-white"
                >
                  {year}
                </Link>
              ),
              t.name,
            ]}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StatusBadge status={status} />
            <span className="font-condensed text-xs tracking-[0.2em] text-white/60 uppercase">
              {t.class}
            </span>
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight font-semibold tracking-wide uppercase sm:text-5xl">
            {t.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" />{" "}
              {formatDateRange(t.date_from, t.date_to)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" /> {t.location}
            </span>
            {status === "completed" ? (
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" /> {teams.length} teams listed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" /> {left} of {total} spots left
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="min-w-0">
          {imageUrl && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl border bg-card"
              aria-label={`Enlarge ${t.image?.alternativeText || t.name} photo`}
            >
              <img
                src={imageUrl}
                alt={t.image?.alternativeText || t.image?.caption || t.name}
                className="max-h-[32rem] w-full object-contain"
              />
            </a>
          )}
          {t.content ? (
            <div
              className="mt-4 leading-relaxed text-muted-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: t.content }}
            />
          ) : description ? (
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}

          {/* teams */}
          <h2 className="mt-10 font-display text-2xl font-semibold tracking-wide uppercase">
            Participating teams
          </h2>
          {teams.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Teams will be announced once registration opens.
            </p>
          ) : (
            <div className="mt-4 grid gap-2">
              {teams.map((team) => (
                <div
                  key={team.id + team.name}
                  className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
                >
                  <span>
                    <span className="block text-sm font-semibold">
                      {team.name}
                    </span>
                    {team.hometown && (
                      <span className="block text-xs text-muted-foreground">
                        {team.hometown}
                      </span>
                    )}
                  </span>
                  <Badge variant={team.isPaid ? "default" : "outline"}>
                    {team.isPaid ? (
                      <>
                        <Check data-icon="inline-start" /> Paid
                      </>
                    ) : (
                      "Payment pending"
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Schedule documents and written results come from the original record. */}
          <section className="mt-10" aria-labelledby="results-heading">
            <h2
              id="results-heading"
              className="font-display text-2xl font-semibold tracking-wide uppercase"
            >
              Schedule, brackets & results
            </h2>
            <Card className="mt-4">
              <CardContent className="flex flex-col items-start gap-4 py-6">
                {t.bracketResults && (
                  <div
                    className="text-sm leading-relaxed [&_p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: t.bracketResults }}
                  />
                )}
                {bracketUrl && (
                  <a
                    href={bracketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    <Download data-icon="inline-start" /> View tournament
                    bracket
                    {t.finalBracket?.mime === "application/pdf" ||
                    bracketUrl.toLowerCase().endsWith(".pdf")
                      ? " (PDF)"
                      : ""}
                    <ExternalLink data-icon="inline-end" />
                  </a>
                )}
                {!hasResults && (
                  <p className="text-sm text-muted-foreground">
                    A bracket or written results have not been posted for this
                    tournament.
                  </p>
                )}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4"
                >
                  Game scores, scorebooks & award photos on Facebook{" "}
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </CardContent>
            </Card>
          </section>

          {t.resultsMedia.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold tracking-wide uppercase">
                Photos
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {t.resultsMedia.map((m) => {
                  const src = apiUrl(m.url)
                  if (!src) return null
                  return (
                    <figure
                      key={m.id}
                      className="overflow-hidden rounded-xl border bg-card"
                    >
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${m.caption || m.alternativeText || m.name}`}
                      >
                        {m.mime?.startsWith("image/") ||
                        /\.(jpe?g|png|webp|gif)$/i.test(m.url) ? (
                          <img
                            src={src}
                            alt={m.alternativeText || m.caption || t.name}
                            className="aspect-[4/3] w-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span className="flex items-center gap-2 p-6 text-sm font-semibold text-primary">
                            <Download className="size-4" /> {m.name}
                          </span>
                        )}
                      </a>
                      {m.caption && (
                        <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                          {m.caption}
                        </figcaption>
                      )}
                    </figure>
                  )
                })}
              </div>
            </div>
          )}

          {/* weekend format */}
          <div className="mt-10 rounded-xl border bg-card p-6">
            <p className="font-display text-lg font-semibold tracking-wide uppercase">
              Typical invitational weekend
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              D21 typically runs five-team round robins with a four-game
              guarantee. Dates and formats can vary; follow this tournament’s
              bracket for its actual game schedule.
            </p>
            <Separator className="my-4" />
            <ul className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">Friday:</strong> two games
                starting 7:00 PM under the lights.
              </li>
              <li>
                <strong className="text-foreground">Saturday:</strong> full day
                from 9:00–10:00 AM.
              </li>
              <li>
                <strong className="text-foreground">Sunday:</strong> round-robin
                games from 8:00 AM, one-game championship ~11:30 AM / noon.
              </li>
            </ul>
          </div>
        </div>

        {/* sticky register panel */}
        <aside className="lg:pt-1">
          <div className="rounded-2xl border bg-card p-6 shadow-sm lg:sticky lg:top-32">
            <p className="font-condensed text-xs tracking-[0.22em] text-primary uppercase">
              Entry fee
            </p>
            <p className="mt-1 font-display text-4xl font-semibold">
              {t.price ? `$${t.price}` : "TBD"}
            </p>
            <p className="text-sm text-muted-foreground">per team</p>
            <Separator className="my-5" />
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Dates</dt>
                <dd className="font-medium">
                  {formatDateRange(t.date_from, t.date_to)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Class</dt>
                <dd className="font-medium">{t.class}</dd>
              </div>
              {status === "completed" ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Teams</dt>
                  <dd className="font-medium">{teams.length}</dd>
                </div>
              ) : (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Spots left</dt>
                  <dd className="font-medium">
                    {left} of {total}
                  </dd>
                </div>
              )}
            </dl>
            <Link
              to="/register"
              search={{ tournament: t.slug }}
              className="mt-6 block"
            >
              <Button
                size="lg"
                className="w-full font-semibold"
                disabled={
                  status === "completed" ||
                  status === "closed" ||
                  status === "full"
                }
              >
                {status === "completed" ? (
                  "Tournament complete"
                ) : status === "full" ? (
                  "Tournament full"
                ) : (
                  <>
                    Register for this tournament{" "}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Contact Scott Kelly to confirm registration and payment.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
