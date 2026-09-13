import { createFileRoute, Outlet, useMatch } from "@tanstack/react-router";
import { SectionHeading, TournamentCard } from "@/components/shared";
import { SEASON_YEAR } from "@/lib/data";
import { fetchSeasonTournaments } from "@/lib/tournaments";

export const Route = createFileRoute("/tournaments")({
  loader: () => fetchSeasonTournaments(SEASON_YEAR),
  component: TournamentsPage,
});

function TournamentsPage() {
  const tournaments = Route.useLoaderData();
  const slugMatch = useMatch({ from: "/tournaments/$slug", shouldThrow: false });
  if (slugMatch) return <Outlet />;
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        kicker={`Summer ${SEASON_YEAR}`}
        title="Tournaments"
        lede="All tourneys are fast pitch at Waterfront Park, Petoskey MI. Five-team round robins, four-game guarantee, Friday night to Sunday championship."
      />
      {tournaments.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-sm">No tournaments posted for this season yet — check back soon.</p>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <TournamentCard key={t.slug} t={t} />
          ))}
        </div>
      )}
      <div className="mt-10 rounded-xl border bg-card p-6 text-sm leading-relaxed">
        <p className="font-semibold">Good to know</p>
        <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5">
          <li>Entry fees are per team, paid once via Stripe checkout.</li>
          <li>Paid teams are locked to the roster name — contact the commissioner for swaps.</li>
          <li>Brackets and final results post to each tournament page and the Archives.</li>
          <li>Questions? scott@d21softball.org — (231) 547-1144.</li>
        </ul>
      </div>
    </div>
  );
}
