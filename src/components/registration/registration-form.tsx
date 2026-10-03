import { useEffect, useMemo, useRef, useState } from "react"
import { revalidateLogic, useStore } from "@tanstack/react-form"
import {
  CalendarDays,
  Check,
  CircleAlert,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
} from "lucide-react"
import { useAppForm } from "@/components/forms/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { canRegister, formatDateRange } from "@/lib/data"
import {
  createRegistrationSchema,
  entryFee,
  hasRegistrationDraft,
  REGISTRATION_DRAFT_KEY,
  registrationDefaults,
  registrationSubmission,
  restoreRegistrationDraft,
  serializeRegistrationDraft,
} from "@/lib/registration"
import type { RegistrationSubmission } from "@/lib/registration"
import type { ApiTournament } from "@/lib/tournaments"
import { cn } from "@/lib/utils"
import { DetailsStep, ReviewStep, TournamentStep } from "./steps"

const steps = [
  {
    label: "Tournament",
    title: "Choose your weekend",
  },
  {
    label: "Team & contact",
    title: "Let’s meet your team",
  },
  {
    label: "Review",
    title: "Check your registration",
  },
] as const

export function RegistrationForm({
  tournaments,
  preselectedSlug,
  now,
  onCheckout,
  onRestart,
}: {
  tournaments: ApiTournament[]
  preselectedSlug?: string
  now?: Date
  onCheckout?: (submission: RegistrationSubmission) => Promise<void>
  onRestart?: () => void
}) {
  const [step, setStep] = useState(0)
  const [draftReady, setDraftReady] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const [canSaveDraft, setCanSaveDraft] = useState(true)
  const [invalid, setInvalid] = useState(false)
  const [checkoutError, setCheckoutError] = useState("")
  const [checked, setChecked] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(0)
  const schema = useMemo(
    () => createRegistrationSchema(tournaments, now),
    [tournaments, now]
  )
  const validPreselection = tournaments.find(
    (item) => item.slug === preselectedSlug && canRegister(item, now)
  )?.slug
  const [defaultValues] = useState(() =>
    registrationDefaults(validPreselection)
  )

  function focusInvalid() {
    requestAnimationFrame(() => {
      const field = contentRef.current?.querySelector<HTMLElement>(
        'input[aria-invalid="true"]:not([disabled]):not([aria-hidden="true"]), button[aria-invalid="true"], textarea[aria-invalid="true"], [role="radio"][aria-invalid="true"]:not([aria-disabled="true"]), [role="checkbox"][aria-invalid="true"]'
      )
      ;(field ?? headingRef.current)?.focus()
    })
  }

  function handleInvalid() {
    setInvalid(true)
    focusInvalid()
  }

  const form = useAppForm({
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
    onSubmitInvalid: ({ value }) => {
      const result = schema.safeParse(value)
      if (!result.success) {
        const section = result.error.issues[0]?.path[0]
        setStep(section === "tournament" ? 0 : section === "details" ? 1 : 2)
      }
      handleInvalid()
    },
    onSubmit: async ({ value }) => {
      setInvalid(false)
      setCheckoutError("")
      if (!onCheckout) {
        setChecked(true)
        return
      }
      try {
        await onCheckout(registrationSubmission(schema.parse(value)))
      } catch (error) {
        setCheckoutError(
          error instanceof Error
            ? error.message
            : "We couldn’t start checkout. Please try again."
        )
      }
    },
  })
  const values = useStore(form.store, (state) => state.values)
  const pending = useStore(form.store, (state) => state.isSubmitting)
  const selected = tournaments.find(
    (item) => item.slug === values.tournament.slug
  )

  useEffect(() => {
    try {
      const restored = restoreRegistrationDraft(
        sessionStorage.getItem(REGISTRATION_DRAFT_KEY),
        tournaments,
        now
      )
      if (restored) {
        if (validPreselection) restored.tournament.slug = validPreselection
        form.reset(restored, { keepDefaultValues: true })
        setDraftRestored(true)
      } else {
        sessionStorage.removeItem(REGISTRATION_DRAFT_KEY)
      }
    } catch {
      setCanSaveDraft(false)
    }
    setDraftReady(true)
    // Load once on mount so a route refresh cannot overwrite active edits.
  }, [])

  useEffect(() => {
    if (!draftReady || !canSaveDraft) return
    try {
      if (hasRegistrationDraft(values))
        sessionStorage.setItem(
          REGISTRATION_DRAFT_KEY,
          serializeRegistrationDraft(values, now?.getTime())
        )
      else sessionStorage.removeItem(REGISTRATION_DRAFT_KEY)
    } catch {
      setCanSaveDraft(false)
    }
  }, [values, draftReady, canSaveDraft, now])

  useEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    })
  }, [step])

  function goToStep(next: number) {
    setInvalid(false)
    setCheckoutError("")
    setStep(next)
  }

  function startOver() {
    onRestart?.()
    form.reset(registrationDefaults(), { keepDefaultValues: true })
    setDraftRestored(false)
    setChecked(false)
    goToStep(0)
    try {
      sessionStorage.removeItem(REGISTRATION_DRAFT_KEY)
    } catch {
      /* Draft saving can be disabled by the browser. */
    }
    headingRef.current?.focus()
  }

  const stepProps = {
    form,
    tournaments,
    now,
    onNext: () => goToStep(step + 1),
    onBack: () => goToStep(step - 1),
    onInvalid: handleInvalid,
    pending,
  }

  return (
    <div className="mt-8">
      {preselectedSlug && !validPreselection && (
        <Alert className="mb-6">
          <AlertDescription>
            The tournament in your link is no longer available for registration.
            Please choose an available tournament below.
          </AlertDescription>
        </Alert>
      )}
      <nav aria-label="Registration steps" className="mb-8">
        <ol className="grid grid-cols-3 gap-2 sm:gap-4">
          {steps.map((item, index) => (
            <li key={item.label}>
              <button
                type="button"
                disabled={index >= step || pending}
                onClick={() => goToStep(index)}
                aria-current={index === step ? "step" : undefined}
                className={cn(
                  "flex w-full items-start gap-2 border-b-2 pb-4 text-left sm:items-center sm:gap-3",
                  index <= step ? "border-primary" : "border-border",
                  index < step && "cursor-pointer hover:opacity-80"
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold sm:size-8",
                    index <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {index < step ? (
                    <Check className="size-4" aria-label="Complete" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "pt-1 text-xs font-semibold sm:pt-0 sm:text-sm",
                    index === step ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div ref={contentRef} className="min-w-0">
          <Card>
            <CardHeader className="px-5 pt-3 sm:px-8">
              <CardTitle>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="scroll-mt-8 font-display text-2xl uppercase outline-none"
                >
                  {steps[step].title}
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4 sm:px-8">
              {invalid && (
                <Alert variant="destructive" className="mb-5">
                  <CircleAlert />
                  <AlertDescription>
                    Please check the highlighted fields before continuing.
                  </AlertDescription>
                </Alert>
              )}
              {checkoutError && (
                <Alert variant="destructive" className="mb-5">
                  <AlertDescription>{checkoutError}</AlertDescription>
                </Alert>
              )}
              {checked && !onCheckout && step === 2 && (
                <Alert className="mb-5">
                  <AlertTitle>Your details are ready</AlertTitle>
                  <AlertDescription>
                    Checkout is not configured.
                  </AlertDescription>
                </Alert>
              )}
              {step === 0 && <TournamentStep {...stepProps} />}
              {step === 1 && <DetailsStep {...stepProps} />}
              {step === 2 && (
                <ReviewStep
                  {...stepProps}
                  onEdit={goToStep}
                  checkoutAvailable={!!onCheckout}
                />
              )}
            </CardContent>
          </Card>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p
              className="max-w-md text-xs leading-relaxed text-muted-foreground"
              role="status"
            >
              {draftReady && canSaveDraft
                ? draftRestored
                  ? "Draft restored."
                  : "Draft saved in this tab."
                : ""}
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={startOver}
              disabled={pending}
            >
              <RotateCcw data-icon="inline-start" /> Start over
            </Button>
          </div>
        </div>
        <aside
          aria-label="Registration summary"
          className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-8"
        >
          {step !== 2 && (
            <Card>
              <CardContent>
                {selected ? (
                  <>
                    <p className="text-base font-semibold">{selected.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selected.class}
                    </p>
                    <div className="mt-4 flex flex-col gap-3 text-sm">
                      <p className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 size-4 shrink-0" />
                        {formatDateRange(selected.date_from, selected.date_to)}
                      </p>
                      <p className="flex items-start gap-2">
                        <MapPin className="mt-0.5 size-4 shrink-0" />
                        {selected.location ||
                          "Contact the commissioner for venue details."}
                      </p>
                    </div>
                    <Separator className="my-5" />
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Entry fee</span>
                      <strong className="text-xl">
                        {entryFee(selected.price)}
                      </strong>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-3 py-2 text-sm text-muted-foreground">
                    <CalendarDays className="size-5 shrink-0" />
                    <p>
                      Dates and entry fees come from the selected tournament.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <div className="px-1 text-sm">
            <p className="font-semibold">Need a hand?</p>
            <div className="mt-3 flex flex-col items-start gap-1">
              <a
                href="mailto:scott@d21softball.org"
                className={buttonVariants({ variant: "link" })}
              >
                <Mail data-icon="inline-start" /> scott@d21softball.org
              </a>
              <a
                href="tel:+12315471144"
                className={buttonVariants({ variant: "link" })}
              >
                <Phone data-icon="inline-start" /> (231) 547-1144
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
