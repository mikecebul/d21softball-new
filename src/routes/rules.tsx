import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionHeading } from "@/components/shared";
import { Download, Ban } from "lucide-react";

export const Route = createFileRoute("/rules")({ component: RulesPage });

const committee = [
  { name: "Scott Kelly", role: "District Commissioner", location: "Charlevoix, MI" },
  { name: "TBD", role: "Classification Chair", location: "Michigan" },
  { name: "TBD", role: "Player Representative", location: "Michigan" },
];

function RulesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        kicker="Eligibility & equipment"
        title="Rules & classification"
        lede="Check your pitcher's classification and your bats before you register — both are enforced at check-in."
      />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="grid gap-3 py-6">
            <p className="font-display text-2xl font-semibold uppercase">Pitcher classification</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The USA Softball of Michigan pitcher list determines which classes
              your pitcher is eligible for. Managers are responsible for verifying
              their staff before tournament weekend.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button><Download className="size-4" /> 2026 pitcher list (PDF)</Button>
              <Button variant="outline">Appeal process</Button>
            </div>
            <div className="mt-2 overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Location</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {committee.map((c) => (
                    <TableRow key={c.name + c.role}><TableCell className="font-medium">{c.name}</TableCell><TableCell>{c.role}</TableCell><TableCell>{c.location}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-3 py-6">
            <p className="font-display flex items-center gap-2 text-2xl font-semibold uppercase">
              <Ban className="size-6 text-destructive" /> Banned & certified bats
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Only USA Softball certified equipment is legal. Umpires check bats
              at the plate — illegal bats mean the batter is out and ejected per
              USA Softball rules.
            </p>
            <a href="https://www.usasoftball.com/certified-equipment/" target="_blank" rel="noreferrer">
              <Button variant="outline">Certified equipment list</Button>
            </a>
            <Accordion defaultValue={["appeal"]}>
              <AccordionItem value="appeal">
                <AccordionTrigger>How classification appeals work</AccordionTrigger>
                <AccordionContent>
                  Submit your appeal in writing to the district commissioner with
                  season stats and references. The committee reviews before the
                  next tournament weekend — decisions are final for the season.
                  (UI preview; full text migrates from the current site.)
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="checkin">
                <AccordionTrigger>What happens at check-in?</AccordionTrigger>
                <AccordionContent>
                  Roster verification, pitcher eligibility check and bat inspection
                  happen before your first Friday game. Bring photo ID for new
                  pickups.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
