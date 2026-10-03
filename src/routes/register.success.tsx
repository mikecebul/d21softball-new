import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { buttonVariants } from "@/components/ui/button"
import { getRegistrationStatus } from "@/lib/registration-status"

export const Route = createFileRoute("/register/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : "",
  }),
  component: RegistrationStatusPage,
})

function RegistrationStatusPage() {
  const { session_id } = Route.useSearch()
  const query = useQuery({
    queryKey: ["registration-status", session_id],
    queryFn: () => getRegistrationStatus({ data: { sessionId: session_id } }),
    enabled: /^cs_(test_)?[a-zA-Z0-9]+$/.test(session_id),
    refetchInterval: (state) =>
      state.state.data?.status === "pending" &&
      !["failed", "expired", "cancelled"].includes(
        state.state.data.paymentStatus
      )
        ? 2500
        : false,
    retry: 1,
  })
  const confirmed = query.data?.status === "confirmed"
  const incomplete =
    query.data?.status === "pending" &&
    ["failed", "expired", "cancelled"].includes(query.data.paymentStatus)
  const unknown =
    query.isError ||
    !/^cs_(test_)?[a-zA-Z0-9]+$/.test(session_id) ||
    query.data?.status === "unknown"
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="font-condensed text-xs font-semibold tracking-[0.22em] text-primary uppercase">
        Tournament registration
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold uppercase">
        {confirmed
          ? "You’re registered"
          : incomplete
            ? "Payment not completed"
            : unknown
              ? "Check your registration"
              : "Confirming your payment"}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {confirmed
          ? `Your entry${query.data?.tournament ? ` for ${query.data.tournament}` : ""} is confirmed${query.data?.livemode === false ? " in test mode" : ""}.`
          : incomplete
            ? "Your details are saved. Return to registration to finish checkout."
            : unknown
              ? "We couldn’t verify this entry. Contact Scott Kelly if you completed payment."
              : "Waiting for Stripe’s payment confirmation. You can leave this page; your entry is saved."}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {incomplete && (
          <Link to="/register" className={buttonVariants()}>
            Finish registration
          </Link>
        )}
        <Link
          to="/tournaments"
          className={buttonVariants({ variant: "outline" })}
        >
          View tournaments
        </Link>
        <a
          href="mailto:scott@d21softball.org"
          className={buttonVariants({ variant: "link" })}
        >
          Contact Scott Kelly
        </a>
      </div>
    </div>
  )
}
