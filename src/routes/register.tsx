import { createFileRoute, Link, Outlet, useMatch, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { formatDateRange, SEASON_YEAR, spotsLeftFor, spotsTotalFor, tournamentStatus } from "@/lib/data";
import { fetchSeasonTournaments } from "@/lib/tournaments";
import { ArrowLeft, ArrowRight, Check, CreditCard, Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>): { tournament?: string } => ({
    tournament: typeof s.tournament === "string" ? s.tournament : undefined,
  }),
  loader: () => fetchSeasonTournaments(SEASON_YEAR),
  component: RegisterPage,
});

const STEPS = ["Tournament", "Team", "Contact", "Review & pay"] as const;

interface Form {
  tournamentSlug: string;
  teamName: string;
  hometown: string;
  classification: string;
  rosterSize: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  notes: string;
  agreeRules: boolean;
  agreeWaiver: boolean;
}

const initial = (preselected?: string): Form => ({
  tournamentSlug: preselected ?? "",
  teamName: "",
  hometown: "",
  classification: "",
  rosterSize: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "Manager",
  notes: "",
  agreeRules: false,
  agreeWaiver: false,
});

function RegisterPage() {
  const { tournament } = Route.useSearch();
  const tournaments = Route.useLoaderData();
  const successMatch = useMatch({ from: "/register/success", shouldThrow: false });
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(() => initial(tournament));
  const [touched, setTouched] = useState(false);
  const [processing, setProcessing] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const selected = form.tournamentSlug ? tournaments.find((x) => x.slug === form.tournamentSlug) : undefined;

  const errors = useMemo(() => {
    const e: string[] = [];
    if (step === 0 && !form.tournamentSlug) e.push("Choose a tournament to continue.");
    if (step === 1) {
      if (form.teamName.trim().length < 2) e.push("Team name is required.");
      if (form.hometown.trim().length < 2) e.push("Hometown is required.");
      if (!form.classification) e.push("Pick your classification.");
    }
    if (step === 2) {
      if (form.firstName.trim().length < 1) e.push("First name is required.");
      if (form.lastName.trim().length < 1) e.push("Last name is required.");
      if (!/^\S+@\S+\.\S+$/.test(form.email)) e.push("A valid email is required for the receipt.");
      if (form.phone.trim().length < 7) e.push("A phone number is required.");
    }
    if (step === 3) {
      if (!form.agreeRules) e.push("Please accept the tournament rules.");
      if (!form.agreeWaiver) e.push("Please accept the waiver.");
    }
    return e;
  }, [form, step]);

  const next = () => {
    setTouched(true);
    if (errors.length) return;
    setTouched(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    setTouched(false);
    setStep((s) => Math.max(s - 1, 0));
  };

  const pay = () => {
    setTouched(true);
    if (errors.length) return;
    setProcessing(true);
    // UI-only: simulate Stripe redirect handoff. Wire to Stripe Checkout later.
    setTimeout(() => {
      navigate({
        to: "/register/success",
        search: {
          order: `D21-${Math.floor(100000 + Math.random() * 900000)}`,
          tournament: form.tournamentSlug,
          team: form.teamName,
          email: form.email,
        },
      });
    }, 1400);
  };

  if (successMatch) return <Outlet />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="font-condensed text-xs font-semibold tracking-[0.22em] text-primary uppercase">
        Tournament registration — {SEASON_YEAR} season
      </p>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-wide uppercase sm:text-5xl">
        Register for a tournament
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
        No account, no dashboard. Pick your tournament, tell us about your team,
        then secure payment with Stripe. You'll get a confirmation and receipt by email.
      </p>

      {/* stepper */}
      <div className="mt-8">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                  i < step
                    ? "bg-emerald-600 text-white"
                    : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span className={cn("hidden text-sm font-medium sm:block", i === step ? "text-foreground" : "text-muted-foreground")}>
                {s}
              </span>
              {i < STEPS.length - 1 && <span className="bg-border h-px flex-1" />}
            </div>
          ))}
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-4" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.7fr]">
        <div className="min-w-0">
          {step === 0 && (
            <Card>
              <CardContent className="grid gap-3 py-6">
                <p className="font-semibold">Which weekend are you playing?</p>
                <RadioGroup value={form.tournamentSlug} onValueChange={(v) => set("tournamentSlug", v)} className="grid gap-3">
                  {tournaments.map((t) => {
                    const status = tournamentStatus(t);
                    const disabled = status === "completed" || status === "closed";
                    const left = spotsLeftFor(t);
                    const total = spotsTotalFor(t);
                    return (
                      <label
                        key={t.slug}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
                          form.tournamentSlug === t.slug ? "border-primary ring-2 ring-primary/20" : "hover:border-foreground/30",
                          disabled && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <RadioGroupItem value={t.slug} disabled={disabled} className="mt-1" />
                        <span className="flex-1">
                          <span className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold">{t.name}</span>
                            <span className="font-display text-lg font-semibold">{t.price ? `$${t.price}` : "TBD"}</span>
                          </span>
                          <span className="text-muted-foreground mt-1 block text-sm">
                            {t.class} — {formatDateRange(t.date_from, t.date_to)}
                          </span>
                          <span className="text-muted-foreground mt-1 block text-xs">
                            {disabled ? "Completed — see Archives for results." : `${left} of ${total} spots left`}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <CardContent className="grid gap-5 py-6 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <p className="font-semibold">About your team</p>
                  <p className="text-muted-foreground text-sm">This is exactly how your team name appears in brackets and results.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teamName">Team name *</Label>
                  <Input id="teamName" placeholder="e.g. Bay Sox" value={form.teamName} onChange={(e) => set("teamName", e.target.value ?? "")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hometown">Hometown *</Label>
                  <Input id="hometown" placeholder="e.g. Petoskey, MI" value={form.hometown} onChange={(e) => set("hometown", e.target.value ?? "")} />
                </div>
                <div className="grid gap-2">
                  <Label>Classification *</Label>
                  <Select value={form.classification} onValueChange={(v) => set("classification", v ?? "")}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B">Men's Class B</SelectItem>
                      <SelectItem value="C">Men's Class C</SelectItem>
                      <SelectItem value="D">Men's Class D</SelectItem>
                      <SelectItem value="E">Men's Class E</SelectItem>
                      <SelectItem value="50+">50 & Over Open</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Roster size (approx.)</Label>
                  <Select value={form.rosterSize} onValueChange={(v) => set("rosterSize", v ?? "")}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10-12">10–12 players</SelectItem>
                      <SelectItem value="13-15">13–15 players</SelectItem>
                      <SelectItem value="16+">16+ players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="notes">Anything we should know? (optional)</Label>
                  <Textarea id="notes" placeholder="Arrival time, scheduling constraints, questions…" value={form.notes} onChange={(e) => set("notes", e.target.value ?? "")} />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardContent className="grid gap-5 py-6 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <p className="font-semibold">Who's the contact?</p>
                  <p className="text-muted-foreground text-sm">Receipts and weekend logistics go here. No account is created.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First name *</Label>
                  <Input id="firstName" value={form.firstName} onChange={(e) => set("firstName", e.target.value ?? "")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last name *</Label>
                  <Input id="lastName" value={form.lastName} onChange={(e) => set("lastName", e.target.value ?? "")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="you@team.com" value={form.email} onChange={(e) => set("email", e.target.value ?? "")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" type="tel" placeholder="(231) 555-0100" value={form.phone} onChange={(e) => set("phone", e.target.value ?? "")} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => set("role", v ?? "")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Coach">Coach</SelectItem>
                      <SelectItem value="Player">Player</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardContent className="grid gap-5 py-6">
                <p className="font-semibold">Review & pay</p>
                <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
                  <p><strong>{form.teamName || "—"}</strong> ({form.hometown || "—"}) — {form.classification ? `Class ${form.classification}` : "class TBD"}</p>
                  <p className="text-muted-foreground mt-1">
                    {selected ? `${selected.name} — ${formatDateRange(selected.date_from, selected.date_to)}` : "No tournament selected"} • Contact: {form.firstName} {form.lastName} ({form.email})
                  </p>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-sm">
                  <Checkbox checked={form.agreeRules} onCheckedChange={(v) => set("agreeRules", v === true)} className="mt-0.5" />
                  <span>I agree to USA Softball rules, the pitcher classification list and approved-bat rules. <Link to="/rules" className="font-semibold text-primary hover:underline">Review rules</Link>.</span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-sm">
                  <Checkbox checked={form.agreeWaiver} onCheckedChange={(v) => set("agreeWaiver", v === true)} className="mt-0.5" />
                  <span>Our roster participates at its own risk and will follow Waterfront Park ground rules and the weekend schedule.</span>
                </label>
                <div className="rounded-xl bg-[var(--navy-deep)] p-5 text-white">
                  <p className="font-condensed text-xs tracking-[0.2em] text-white/60 uppercase">Stripe secure checkout (UI preview)</p>
                  <p className="mt-2 text-sm text-white/75">
                    This button will create a Stripe Checkout Session (Payload order + <code className="rounded bg-white/10 px-1">checkout_session</code>) and redirect to Stripe. Payment confirms the order and marks your team paid.
                  </p>
                  <Button size="lg" className="mt-4 w-full font-semibold" onClick={pay} disabled={processing}>
                    {processing ? "Redirecting to Stripe…" : <><Lock className="size-4" /> Pay {selected?.price ? `$${selected.price}` : ""} with Stripe <CreditCard className="size-4" /></>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {touched && errors.length > 0 && (
            <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
              <p className="font-semibold text-destructive">Please fix the following:</p>
              <ul className="mt-1 list-disc pl-5 text-destructive/90">
                {errors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={back} disabled={step === 0 || processing}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next} className="font-semibold">
                Continue <ArrowRight className="size-4" />
              </Button>
            ) : (
              <p className="text-muted-foreground hidden items-center gap-1.5 text-xs sm:flex">
                <Lock className="size-3.5" /> 256-bit encrypted Stripe checkout
              </p>
            )}
          </div>
        </div>

        {/* summary rail */}
        <aside>
          <div className="rounded-2xl border bg-card p-6 lg:sticky lg:top-32">
            <p className="font-condensed flex items-center gap-1.5 text-xs tracking-[0.22em] text-primary uppercase">
              <Trophy className="size-4" /> Order summary
            </p>
            {selected ? (
              <div className="mt-3">
                <p className="font-semibold">{selected.name}</p>
                <p className="text-muted-foreground text-sm">{selected.class}</p>
                <p className="text-muted-foreground text-sm">{formatDateRange(selected.date_from, selected.date_to)}</p>
                {form.teamName && <p className="mt-2 text-sm">Team: <strong>{form.teamName}</strong> — {form.hometown}</p>}
                <Separator className="my-4" />
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Entry fee</span><span className="font-medium">{selected.price ? `$${selected.price}.00` : "TBD"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Stripe processing</span><span className="font-medium">at checkout</span></div>
                <Separator className="my-4" />
                <div className="flex justify-between"><span className="font-semibold">Total due</span><span className="font-display text-2xl font-semibold">{selected.price ? `$${selected.price}` : "TBD"}</span></div>
              </div>
            ) : (
              <p className="text-muted-foreground mt-3 text-sm">Pick a tournament to see your total.</p>
            )}
            <Separator className="my-4" />
            <ul className="text-muted-foreground space-y-1.5 text-xs leading-relaxed">
              <li>• 5-team round robin</li>
              <li>• Brackets posted on the tournament page</li>
              <li>• Receipt + confirmation by email</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
