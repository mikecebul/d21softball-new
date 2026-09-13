import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared";
import { BedDouble, Fuel, MapPin, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/visit")({ component: VisitPage });

function VisitPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        kicker="Plan the trip"
        title="Visit Petoskey"
        lede="Waterfront Park sits on Little Traverse Bay — sunsets behind the outfield fence, downtown a short walk away."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card>
          <CardContent className="grid gap-3 py-6">
            <BedDouble className="size-7 text-primary" />
            <p className="font-display text-2xl font-semibold uppercase">Where to stay</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Teams book out fast on tournament weekends. Start with the Petoskey
              Area Visitors Bureau for hotels, cottages and campgrounds near the
              waterfront.
            </p>
            <a href="https://www.petoskeyarea.com" target="_blank" rel="noreferrer">
              <Button>PetoskeyArea.com <ExternalLink className="size-4" /></Button>
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-3 py-6">
            <Fuel className="size-7 text-primary" />
            <p className="font-display text-2xl font-semibold uppercase">Fuel & convenience</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              EZ Mart convenience stores and Blarney Castle Oil keep travel teams
              rolling across Michigan — fuel, food and late-night runs all weekend.
            </p>
            <a href="https://blarneycastleoil.com" target="_blank" rel="noreferrer">
              <Button variant="outline">Find EZ Mart locations <ExternalLink className="size-4" /></Button>
            </a>
          </CardContent>
        </Card>
      </div>
      <div className="mt-5 rounded-xl bg-[var(--navy-deep)] p-6 text-white sm:p-8">
        <p className="font-condensed flex items-center gap-1.5 text-xs tracking-[0.22em] text-white/60 uppercase">
          <MapPin className="size-4" /> Getting to the park
        </p>
        <p className="font-display mt-2 text-2xl font-semibold uppercase">Waterfront Park, Petoskey MI</p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
          District contact: Scott Kelly, 101 M-66 N, Charlevoix, MI 49720 —
          scott@d21softball.org — (231) 547-1144. Ample parking at the waterfront;
          arrive early Friday for the 7:00 PM first pitch.
        </p>
      </div>
    </div>
  );
}
