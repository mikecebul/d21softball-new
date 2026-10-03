import { createFileRoute, Outlet, useMatch } from "@tanstack/react-router"
import {
  clearCheckoutRequest,
  registrationCheckout,
} from "@/lib/checkout-client"
import { RegistrationForm } from "@/components/registration/registration-form"
import { SEASON_YEAR } from "@/lib/data"
import { createRegistrationPreviewTournament } from "@/lib/registration-preview-tournament"
import { getSeasonTournaments } from "@/lib/tournaments"

export const Route = createFileRoute("/register")({
  validateSearch: (
    search: Record<string, unknown>
  ): { tournament?: string } => ({
    tournament:
      typeof search.tournament === "string" ? search.tournament : undefined,
  }),
  loader: async () => {
    const tournaments = await getSeasonTournaments({
      data: { year: SEASON_YEAR },
    })
    return import.meta.env.DEV
      ? [createRegistrationPreviewTournament(), ...tournaments]
      : tournaments
  },
  head: () => ({
    meta: [
      { title: "Register your team | District 21 Softball" },
      {
        name: "description",
        content:
          "Choose a District 21 Softball tournament and prepare your team registration in three simple steps. No account required.",
      },
    ],
  }),
  component: RegisterPage,
})

function RegisterPage() {
  const successMatch = useMatch({
    from: "/register/success",
    shouldThrow: false,
  })
  return successMatch ? <Outlet /> : <TournamentRegistrationPage />
}

function TournamentRegistrationPage() {
  const { tournament } = Route.useSearch()
  const tournaments = Route.useLoaderData()
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-condensed text-xs font-semibold tracking-[0.22em] text-primary uppercase">
        Tournament registration · {SEASON_YEAR} season
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase sm:text-5xl">
        Register your team
      </h1>
      <RegistrationForm
        key={tournament ?? "registration"}
        tournaments={tournaments}
        preselectedSlug={tournament}
        onCheckout={registrationCheckout}
        onRestart={clearCheckoutRequest}
      />
    </div>
  )
}
