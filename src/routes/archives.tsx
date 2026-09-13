import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/shared";
import { archiveResults, archiveYears } from "@/lib/data";
import { Trophy, Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/archives")({ component: ArchivesPage });

function ArchivesPage() {
  const slugMatch = useMatch({ from: "/archives/$slug", shouldThrow: false });
  if (slugMatch) return <Outlet />;
  const [year, setYear] = useState<number | "all">("all");
  const [q, setQ] = useState("");
  const items = archiveResults.filter(
    (r) =>
      (year === "all" || r.year === year) &&
      (q.trim() === "" || `${r.name} ${r.champion ?? ""} ${r.class}`.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        kicker="20+ years at the waterfront"
        title="Archives & results"
        lede="Every memorial weekend, state final and invitational — champions, runners-up and brackets going back to 2003."
      />
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Button size="sm" variant={year === "all" ? "default" : "outline"} onClick={() => setYear("all")}>All years</Button>
        {archiveYears.map((y) => (
          <Button key={y} size="sm" variant={year === y ? "default" : "outline"} onClick={() => setYear(y)}>{y}</Button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input placeholder="Search teams, events…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <Card key={r.slug + r.year} className="transition hover:shadow-md">
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={cn("font-semibold")}>{r.year}</Badge>
                <span className="text-muted-foreground text-xs">{r.dateLabel}</span>
              </div>
              <p className="font-display mt-3 text-xl font-semibold tracking-wide uppercase">{r.name}</p>
              <p className="text-muted-foreground text-xs">{r.class}</p>
              {r.champion ? (
                <p className="mt-3 flex items-start gap-1.5 text-sm">
                  <Trophy className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span><strong>{r.champion}</strong> <span className="text-muted-foreground">d. {r.runnerUp}</span></span>
                </p>
              ) : (
                <p className="text-muted-foreground mt-3 text-sm">Results coming soon.</p>
              )}
              <Link to="/archives/$slug" params={{ slug: r.slug }} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                View recap <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-muted-foreground mt-10 text-center text-sm">No results match that filter yet.</p>
      )}
    </div>
  );
}
