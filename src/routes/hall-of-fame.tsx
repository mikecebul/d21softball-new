import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared";
import { hallOfFame } from "@/lib/data";
import { Medal } from "lucide-react";

export const Route = createFileRoute("/hall-of-fame")({ component: HOFPage });

function HOFPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        kicker="Builders, players & legends"
        title="Hall of Fame"
        lede="The commissioners, coaches, umpires and players who built fastpitch at the waterfront — and the memorial weekends that carry their names."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hallOfFame.map((m) => (
          <Card key={m.name}>
            <CardContent className="py-6">
              <Medal className="size-7 text-primary" />
              <p className="font-display mt-3 text-2xl font-semibold tracking-wide uppercase">{m.name}</p>
              <p className="text-muted-foreground text-sm">{m.position} — {m.location} • Inducted {m.year}</p>
              <p className="mt-3 text-sm leading-relaxed">{m.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
