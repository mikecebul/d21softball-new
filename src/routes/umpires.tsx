import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared";
import { Whistle } from "lucide-react";

export const Route = createFileRoute("/umpires")({ component: UmpiresPage });

const steps = [
  { t: "Register with USA Softball", d: "Complete the annual umpire registration and background check through USA Softball of Michigan." },
  { t: "Get assigned", d: "Email the district with your availability for June–August weekends — Friday nights through Sunday finals." },
  { t: "Work the waterfront", d: "Five-team round robins, four-game guarantees, championship Sundays on the bay." },
];

function UmpiresPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        kicker="Blue wanted"
        title="Umpire with D21"
        lede="Five weekends, packed houses, championship Sundays. Join the crew behind the plate at one of the prettiest parks in softball."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <Card key={s.t}>
            <CardContent className="py-6">
              <span className="font-display grid size-10 place-items-center rounded-lg bg-[var(--navy)] text-lg font-semibold text-white">{i + 1}</span>
              <p className="mt-3 font-semibold">{s.t}</p>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{s.d}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="mailto:scott@d21softball.org?subject=Umpire%20registration%20—%20D21">
          <Button size="lg" className="font-semibold"><Whistle className="size-4" /> Contact the assignor</Button>
        </a>
        <a href="https://www.usasoftballmi.org" target="_blank" rel="noreferrer">
          <Button size="lg" variant="outline">USA Softball of Michigan</Button>
        </a>
      </div>
      <p className="text-muted-foreground mt-6 text-sm">UI preview — registration packet PDF + clinic dates attach here (Payload single-type).</p>
    </div>
  );
}
