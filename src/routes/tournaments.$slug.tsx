import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared";
import { formatDateRange, spotsLeftFor, spotsTotalFor, tournamentStatus } from "@/lib/data";
import { apiUrl, fetchTournamentBySlug, parseApiTeam, tournamentDescriptionText } from "@/lib/tournaments";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Download, MapPin, Trophy, Users } from "lucide-react";

export const Route = createFileRoute("/tournaments/$slug")({
  loader: async ({ params }) => {
    const t = await fetchTournamentBySlug(params.slug);
    if (!t) throw notFound();
    return t;
  },
  component: TournamentDetailPage,
});

function TournamentDetailPage() {
  const t = Route.useLoaderData();

  const status = tournamentStatus(t);
  const total = spotsTotalFor(t);
  const left = spotsLeftFor(t);
  const teams = t.teams.map(parseApiTeam);
  const paid = teams.filter((x) => x.isPaid);
  const description = tournamentDescriptionText(t);
  const bracketUrl = apiUrl(t.finalBracket?.url);
  const hasResults = Boolean(t.bracketResults || bracketUrl);

  return (
    <div>
      {/* header band */}
      <div className="bg-[var(--navy-deep)] text-white">
        <div className="texture-lines mx-auto max-w-6xl px-4 py-12">
          <Link to="/tournaments" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="size-4" /> All tournaments
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StatusBadge status={status} />
            <span className="font-condensed text-xs tracking-[0.2em] uppercase text-white/60">{t.class}</span>
          </div>
          <h1 className="font-display mt-3 max-w-3xl text-4xl leading-tight font-semibold tracking-wide uppercase sm:text-5xl">
            {t.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" /> {formatDateRange(t.date_from, t.date_to)}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" /> {t.location}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="size-4" /> {left} of {total} spots left</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="min-w-0">
          {t.content ? (
            <div className="text-muted-foreground mt-4 leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: t.content }} />
          ) : description ? (
            <p className="text-muted-foreground mt-4 leading-relaxed">{description}</p>
          ) : null}

          {/* teams */}
          <h2 className="font-display mt-10 text-2xl font-semibold tracking-wide uppercase">Participating teams</h2>
          {teams.length === 0 ? (
            <p className="text-muted-foreground mt-4 text-sm">Teams will be announced once registration opens.</p>
          ) : (
            <div className="mt-4 grid gap-2">
              {paid.map((team) => (
                <div key={team.id + team.name} className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold">{team.name}</span>
                    {team.hometown && <span className="text-muted-foreground block text-xs">{team.hometown}</span>}
                  </span>
                  <Badge className="bg-emerald-600 text-white"><Check className="size-3" /> Paid</Badge>
                </div>
              ))}
            </div>
          )}

          {/* results */}
          {hasResults && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold tracking-wide uppercase">Brackets & results</h2>
              <Card className="mt-4">
                <CardContent className="grid gap-4 py-6">
                  {t.bracketResults && (
                    <div className="text-sm leading-relaxed [&_p]:mb-3" dangerouslySetInnerHTML={{ __html: t.bracketResults }} />
                  )}
                  {bracketUrl && (
                    <a href={bracketUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline"><Download className="size-4" /> View final bracket (PDF)</Button>
                    </a>
                  )}
                  {!t.bracketResults && !bracketUrl && <p className="text-muted-foreground text-sm">Brackets post here once play begins — follow scores on the D21 Facebook group.</p>}
                </CardContent>
              </Card>
            </div>
          )}

          {t.resultsMedia.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold tracking-wide uppercase">Photos</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {t.resultsMedia.map((m) => {
                  const src = apiUrl(m.url);
                  if (!src) return null;
                  return (
                    <figure key={m.id} className="overflow-hidden rounded-xl border bg-card">
                      <img src={src} alt={m.alternativeText || m.caption || t.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                      {m.caption && <figcaption className="text-muted-foreground px-3 py-2 text-xs">{m.caption}</figcaption>}
                    </figure>
                  );
                })}
              </div>
            </div>
          )}

          {/* weekend format */}
          <div className="mt-10 rounded-xl border bg-card p-6">
            <p className="font-display text-lg font-semibold tracking-wide uppercase">Weekend format</p>
            <Separator className="my-4" />
            <ul className="text-muted-foreground space-y-2 text-sm leading-relaxed">
              <li><strong className="text-foreground">Friday:</strong> two games starting 7:00 PM under the lights.</li>
              <li><strong className="text-foreground">Saturday:</strong> full day from 9:00–10:00 AM.</li>
              <li><strong className="text-foreground">Sunday:</strong> round-robin games from 8:00 AM, one-game championship ~11:30 AM / noon.</li>
            </ul>
          </div>
        </div>

        {/* sticky register panel */}
        <aside className="lg:pt-1">
          <div className="rounded-2xl border bg-card p-6 shadow-sm lg:sticky lg:top-32">
            <p className="font-condensed text-xs tracking-[0.22em] text-primary uppercase">Entry fee</p>
            <p className="font-display mt-1 text-4xl font-semibold">{t.price ? `$${t.price}` : "TBD"}</p>
            <p className="text-muted-foreground text-sm">per team — one-time Stripe checkout</p>
            <Separator className="my-5" />
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Dates</dt><dd className="font-medium">{formatDateRange(t.date_from, t.date_to)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Class</dt><dd className="font-medium">{t.class}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Spots left</dt><dd className="font-medium">{left} of {total}</dd></div>
            </dl>
            <Link to="/register" search={{ tournament: t.slug }} className="mt-6 block">
              <Button size="lg" className="w-full font-semibold" disabled={status === "completed" || status === "closed" || status === "full"}>
                {status === "completed" ? "Tournament complete" : status === "full" ? "Join waitlist" : <>Register this team <ArrowRight className="size-4" /></>}
              </Button>
            </Link>
            <p className="text-muted-foreground mt-3 text-center text-xs">
              No account needed. Takes ~3 minutes.
            </p>
            {status === "completed" && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <Trophy className="size-3.5" /> See Archives for final results.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
