import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { archiveResults } from "@/lib/data";
import { apiUrl, fetchTournamentBySlug, tournamentDescriptionText } from "@/lib/tournaments";
import { ArrowLeft, Download, Trophy } from "lucide-react";

export const Route = createFileRoute("/archives/$slug")({
  loader: async ({ params }) => {
    const archived = archiveResults.find((r) => r.slug === params.slug);
    const live = await fetchTournamentBySlug(params.slug).catch(() => undefined);
    if (!archived && !live) throw notFound();
    return { archived: archived ?? null, live: live ?? null };
  },
  component: ArchiveDetailPage,
});

function ArchiveDetailPage() {
  const { archived, live } = Route.useLoaderData();

  const name = live?.name ?? archived!.name;
  const cls = live?.class ?? archived!.class;
  const description = live ? tournamentDescriptionText(live) : undefined;
  const bracketUrl = live ? apiUrl(live.finalBracket?.url) : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/archives" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All archives
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{archived?.year ?? new Date(live?.date_from ?? Date.now()).getUTCFullYear()}</Badge>
        <span className="text-muted-foreground text-sm">{cls}</span>
      </div>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-wide uppercase sm:text-5xl">{name}</h1>
      {live?.content ? (
        <div className="text-muted-foreground mt-4 leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: live.content }} />
      ) : description ? (
        <p className="text-muted-foreground mt-4 leading-relaxed">{description}</p>
      ) : null}

      <Card className="mt-8">
        <CardContent className="grid gap-4 py-6">
          <p className="font-condensed text-xs tracking-[0.22em] text-primary uppercase">Final result</p>
          {live?.bracketResults ? (
            <div className="text-sm leading-relaxed [&_p]:mb-3" dangerouslySetInnerHTML={{ __html: live.bracketResults }} />
          ) : archived?.champion ? (
            <div className="flex items-center gap-3">
              <Trophy className="size-8 text-primary" />
              <p><span className="font-display text-2xl font-semibold uppercase">{archived.champion}</span><br />
              <span className="text-muted-foreground text-sm">Champion — Runner-up: {archived.runnerUp}</span></p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Results will post here after the championship game.</p>
          )}
          <Separator />
          <div className="flex flex-wrap gap-2">
            {bracketUrl ? (
              <a href={bracketUrl} target="_blank" rel="noreferrer">
                <Button variant="outline"><Download className="size-4" /> Final bracket (PDF)</Button>
              </a>
            ) : (
              <Button variant="outline"><Download className="size-4" /> Final bracket (PDF)</Button>
            )}
            <Button variant="outline">Scorebook gallery</Button>
          </div>
          {live?.resultsMedia && live.resultsMedia.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {live.resultsMedia.map((m) => {
                const src = apiUrl(m.url);
                if (!src) return null;
                return <img key={m.id} src={src} alt={m.alternativeText || m.caption || name} className="rounded-lg border object-cover" loading="lazy" />;
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
