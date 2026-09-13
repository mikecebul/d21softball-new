import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared";
import { localLeagues } from "@/lib/data";
import { CalendarDays, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/local-leagues")({ component: LeaguesPage });

function LeaguesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        kicker="Mid-June → early August"
        title="Local leagues"
        lede="Stay the week. Local men's teams play Tuesday and Thursday nights, women's teams Monday and Wednesday nights at Waterfront Park."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {localLeagues.map((l) => (
          <Card key={l.name}>
            <CardContent className="grid gap-3 py-6">
              <p className="font-display text-2xl font-semibold tracking-wide uppercase">{l.name}</p>
              <p className="inline-flex items-center gap-1.5 text-sm"><CalendarDays className="size-4 text-primary" /> {l.nights} • {l.season}</p>
              <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-4" /> {l.location}</p>
              <p className="inline-flex items-center gap-1.5 text-sm"><Phone className="size-4 text-primary" /> {l.contact}</p>
              <a href="mailto:scott@d21softball.org"><Button className="mt-2 w-full sm:w-auto">Contact the league</Button></a>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 rounded-xl border bg-card p-6 text-sm leading-relaxed">
        <p className="font-semibold">Visiting for a tournament?</p>
        <p className="text-muted-foreground mt-1">Catch a league night while you're in town — first pitch usually 6:30 PM. Schedules post here and on the D21 Facebook group once the season opens.</p>
      </div>
    </div>
  );
}
