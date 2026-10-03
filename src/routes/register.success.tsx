import { createFileRoute, Link } from "@tanstack/react-router"
import { Mail, Phone } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { getTournamentBySlug } from "@/lib/tournaments"

export const Route = createFileRoute("/register/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    tournament: typeof search.tournament === "string" ? search.tournament : "",
  }),
  loaderDeps: ({ search }) => ({ tournament: search.tournament }),
  loader: ({ deps }) =>
    deps.tournament
      ? getTournamentBySlug({ data: { slug: deps.tournament } })
      : undefined,
  component: RegistrationStatusPage,
})

function RegistrationStatusPage() {
  const tournament = Route.useLoaderData()
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="font-condensed text-xs font-semibold tracking-[0.22em] text-primary uppercase">
        Tournament registration
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase">
        Confirm your tournament entry
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Online checkout is not active yet, so this page cannot confirm
        registration or payment. Contact Scott Kelly to confirm your entry
        {tournament ? ` for the ${tournament.name}` : ""}.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          className={buttonVariants()}
          href="mailto:scott@d21softball.org?subject=D21%20registration%20confirmation"
        >
          <Mail data-icon="inline-start" /> Contact Scott Kelly
        </a>
        <a
          className={buttonVariants({ variant: "outline" })}
          href="tel:+12315471144"
        >
          <Phone data-icon="inline-start" /> (231) 547-1144
        </a>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        {tournament && (
          <Link
            to="/tournaments/$slug"
            params={{ slug: tournament.slug }}
            className={buttonVariants({ variant: "outline" })}
          >
            View tournament
          </Link>
        )}
        <Link
          to="/tournaments"
          className={buttonVariants({ variant: "outline" })}
        >
          Browse tournaments & results
        </Link>
      </div>
    </div>
  )
}
