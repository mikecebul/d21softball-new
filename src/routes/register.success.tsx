import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateRange } from "@/lib/data";
import { fetchTournamentBySlug } from "@/lib/tournaments";
import { ArrowRight, CheckCircle2, Mail, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/register/success")({
  validateSearch: (s: Record<string, unknown>) => ({
    order: typeof s.order === "string" ? s.order : "D21-000000",
    tournament: typeof s.tournament === "string" ? s.tournament : "",
    team: typeof s.team === "string" ? s.team : "",
    email: typeof s.email === "string" ? s.email : "",
  }),
  loaderDeps: ({ search }) => ({ tournament: search.tournament }),
  loader: async ({ deps }) =>
    deps.tournament ? await fetchTournamentBySlug(deps.tournament) : undefined,
  component: SuccessPage,
});

function SuccessPage() {
  const { order, team, email } = Route.useSearch();
  const t = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
      <p className="font-condensed mt-4 text-xs font-semibold tracking-[0.22em] text-primary uppercase">
        Payment received (UI preview)
      </p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-wide uppercase sm:text-5xl">
        You're in, {team || "coach"}.
      </h1>
      <p className="text-muted-foreground mx-auto mt-3 max-w-lg leading-relaxed">
        {t ? (
          <>Your entry for the <strong className="text-foreground">{t.name}</strong> ({formatDateRange(t.date_from, t.date_to)}) is confirmed. A receipt is on its way to {email || "your email"}.</>
        ) : (
          <>Your registration is confirmed. A receipt is on its way to {email || "your email"}.</>
        )}
      </p>

      <Card className="mt-8 text-left">
        <CardContent className="grid gap-2 py-6 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Order</span><span className="font-mono font-semibold">{order}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Team</span><span className="font-medium">{team || "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tournament</span><span className="font-medium">{t?.name ?? "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Total paid</span><span className="font-medium">{t?.price ? `$${t.price}.00` : "—"}</span></div>
        </CardContent>
      </Card>

      <div className="mt-8 rounded-xl border bg-muted/40 p-5 text-left text-sm leading-relaxed">
        <p className="font-semibold">What happens next</p>
        <ul className="text-muted-foreground mt-2 space-y-1.5">
          <li className="flex gap-2"><Mail className="mt-0.5 size-4 shrink-0" /> Watch {email || "your inbox"} for bracket timing and check-in details.</li>
          <li className="flex gap-2"><CalendarDays className="mt-0.5 size-4 shrink-0" /> Friday first pitch 7:00 PM at Waterfront Park, Petoskey.</li>
          <li>Questions? scott@d21softball.org — (231) 547-1144.</li>
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {t && (
          <Link to="/tournaments/$slug" params={{ slug: t.slug }}>
            <Button variant="outline">View tournament page</Button>
          </Link>
        )}
        <Link to="/tournaments">
          <Button className="font-semibold">Browse more weekends <ArrowRight className="size-4" /></Button>
        </Link>
      </div>
      <p className="text-muted-foreground mt-6 text-xs">
        Preview only — Stripe webhook + Payload order confirmation get wired in the next phase.
      </p>
    </div>
  );
}
