import { revalidateLogic } from "@tanstack/react-form"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowRight, CalendarDays, Pencil } from "lucide-react"
import { withForm } from "@/components/forms/form"
import { errorMessages } from "@/components/forms/fields"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { canRegister, formatDateRange, tournamentStatus } from "@/lib/data"
import {
  acknowledgementsSchema,
  createTournamentSchema,
  detailsSchema,
  entryFee,
  registrationFormOptions,
  roleOptions,
} from "@/lib/registration"
import type { ApiTournament } from "@/lib/tournaments"

type StepProps = {
  tournaments: ApiTournament[]
  now?: Date
  onNext: () => void | Promise<void>
  onBack: () => void
  onInvalid: () => void
  pending: boolean
}

function Navigation({
  onBack,
  pending,
  first,
  label = "Continue",
}: {
  onBack: () => void
  pending: boolean
  first?: boolean
  label?: string
}) {
  return (
    <div className="mt-8 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-t pt-5 sm:flex sm:justify-between">
      {first ? (
        <span className="text-xs text-muted-foreground">No account needed</span>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={onBack}
          disabled={pending}
        >
          <ArrowLeft data-icon="inline-start" /> Back
        </Button>
      )}
      <Button
        type="submit"
        className="min-h-11 justify-self-end"
        disabled={pending}
      >
        <span className="whitespace-normal">
          {pending ? "Please wait…" : label}
        </span>
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  )
}

export const TournamentStep = withForm({
  ...registrationFormOptions,
  props: {} as StepProps,
  render: function Render({
    form,
    tournaments,
    now,
    onNext,
    onBack,
    onInvalid,
    pending,
  }) {
    const schema = createTournamentSchema(tournaments, now)
    const hasOpenTournament = tournaments.some((item) => canRegister(item, now))
    return (
      <form.FormGroup
        name="tournament"
        validationLogic={revalidateLogic()}
        validators={{ onDynamic: schema }}
        onGroupSubmit={onNext}
        onGroupSubmitInvalid={onInvalid}
      >
        {(group) => (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              void group.handleSubmit()
            }}
          >
            <FieldGroup>
              {!hasOpenTournament && (
                <Alert>
                  <CalendarDays />
                  <AlertDescription>
                    Registration is currently closed for the published
                    tournaments.{" "}
                    <Link to="/tournaments">Browse brackets and results</Link>,
                    or contact Scott Kelly about the next season.
                  </AlertDescription>
                </Alert>
              )}
              <form.AppField name="tournament.slug">
                {(field) => {
                  const errors = errorMessages(field.state.meta.errors)
                  const invalid = errors.length > 0
                  return (
                    <Field data-invalid={invalid}>
                      <FieldSet>
                        <FieldLegend id="tournament-legend" className="sr-only">
                          Choose your tournament
                        </FieldLegend>
                        <RadioGroup
                          name={field.name}
                          value={field.state.value}
                          onValueChange={(value) =>
                            field.handleChange(String(value))
                          }
                          onBlur={field.handleBlur}
                          aria-labelledby="tournament-legend"
                          aria-invalid={invalid}
                          aria-describedby={
                            invalid ? "tournament-error" : undefined
                          }
                        >
                          {tournaments.map((tournament) => {
                            const open = canRegister(tournament, now)
                            const status = tournamentStatus(tournament, now)
                            const id = `tournament-${tournament.id}`
                            return (
                              <FieldLabel key={tournament.slug} htmlFor={id}>
                                <Field
                                  orientation="horizontal"
                                  data-disabled={!open}
                                >
                                  <RadioGroupItem
                                    id={id}
                                    value={tournament.slug}
                                    disabled={!open}
                                    aria-invalid={invalid}
                                    aria-labelledby={`${id}-name`}
                                    aria-describedby={`${id}-date`}
                                  />
                                  <FieldContent>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <span id={`${id}-name`}>
                                        {tournament.name}
                                      </span>
                                      <span className="shrink-0">
                                        {entryFee(tournament.price)}
                                      </span>
                                    </div>
                                    <FieldDescription id={`${id}-date`}>
                                      {formatDateRange(
                                        tournament.date_from,
                                        tournament.date_to
                                      )}
                                    </FieldDescription>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                      <Badge variant="outline">
                                        {tournament.class}
                                      </Badge>
                                      <Badge
                                        variant={open ? "secondary" : "outline"}
                                      >
                                        {open
                                          ? "Open for registration"
                                          : status === "full"
                                            ? "Full"
                                            : "Completed"}
                                      </Badge>
                                    </div>
                                  </FieldContent>
                                </Field>
                              </FieldLabel>
                            )
                          })}
                        </RadioGroup>
                        <FieldError id="tournament-error">
                          {errors.join(" ")}
                        </FieldError>
                      </FieldSet>
                    </Field>
                  )
                }}
              </form.AppField>
            </FieldGroup>
            <Navigation
              first
              onBack={onBack}
              pending={pending || group.state.meta.isSubmitting}
              label="Team details"
            />
          </form>
        )}
      </form.FormGroup>
    )
  },
})

export const DetailsStep = withForm({
  ...registrationFormOptions,
  props: {} as StepProps,
  render: function Render({ form, onNext, onBack, onInvalid, pending }) {
    return (
      <form.FormGroup
        name="details"
        validationLogic={revalidateLogic()}
        validators={{ onDynamic: detailsSchema }}
        onGroupSubmit={onNext}
        onGroupSubmitInvalid={onInvalid}
      >
        {(group) => (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              void group.handleSubmit()
            }}
          >
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Your team</FieldLegend>
                <FieldGroup className="grid sm:grid-cols-2">
                  <form.AppField name="details.teamName">
                    {(field) => (
                      <field.TextField
                        label="Team name"
                        autoComplete="organization"
                        placeholder="e.g. Bay Sox"
                        maxLength={100}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="details.hometown">
                    {(field) => (
                      <field.TextField
                        label="Hometown"
                        autoComplete="address-level2"
                        placeholder="e.g. Petoskey, MI"
                        maxLength={100}
                      />
                    )}
                  </form.AppField>
                </FieldGroup>
              </FieldSet>
              <Separator />
              <FieldSet>
                <FieldLegend>Team contact</FieldLegend>
                <FieldGroup className="grid sm:grid-cols-2">
                  <form.AppField name="details.firstName">
                    {(field) => (
                      <field.TextField
                        label="First name"
                        autoComplete="given-name"
                        maxLength={100}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="details.lastName">
                    {(field) => (
                      <field.TextField
                        label="Last name"
                        autoComplete="family-name"
                        maxLength={100}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="details.email">
                    {(field) => (
                      <field.TextField
                        label="Email address"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="you@example.com"
                        maxLength={254}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="details.phone">
                    {(field) => (
                      <field.TextField
                        label="Phone number"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="(231) 555-0100"
                        maxLength={30}
                      />
                    )}
                  </form.AppField>
                </FieldGroup>
                <form.AppField name="details.role">
                  {(field) => (
                    <field.SelectField
                      label="Your role"
                      options={roleOptions}
                    />
                  )}
                </form.AppField>
              </FieldSet>
              <Separator />
              <form.AppField name="details.notes">
                {(field) => <field.NotesField />}
              </form.AppField>
            </FieldGroup>
            <Navigation
              onBack={onBack}
              pending={pending || group.state.meta.isSubmitting}
              label="Review registration"
            />
          </form>
        )}
      </form.FormGroup>
    )
  },
})

export const ReviewStep = withForm({
  ...registrationFormOptions,
  props: {} as StepProps & {
    onEdit: (step: number) => void
    checkoutAvailable: boolean
  },
  render: function Render({
    form,
    tournaments,
    onBack,
    onInvalid,
    pending,
    onEdit,
    checkoutAvailable,
  }) {
    return (
      <form.FormGroup
        name="acknowledgements"
        validationLogic={revalidateLogic()}
        validators={{ onDynamic: acknowledgementsSchema }}
        onGroupSubmit={() => form.handleSubmit()}
        onGroupSubmitInvalid={onInvalid}
      >
        {(group) => (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              void group.handleSubmit()
            }}
          >
            <form.Subscribe selector={(state) => state.values}>
              {(values) => {
                const selected = tournaments.find(
                  (item) => item.slug === values.tournament.slug
                )
                const { details } = values
                return (
                  <div className="flex flex-col gap-6">
                    <ReviewSection
                      title="Tournament"
                      onEdit={() => onEdit(0)}
                      disabled={pending}
                    >
                      <p className="font-semibold">
                        {selected?.name ?? "No tournament selected"}
                      </p>
                      {selected && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDateRange(
                            selected.date_from,
                            selected.date_to
                          )}{" "}
                          · {selected.class} · {entryFee(selected.price)}
                        </p>
                      )}
                    </ReviewSection>
                    <ReviewSection
                      title="Team & contact"
                      onEdit={() => onEdit(1)}
                      disabled={pending}
                    >
                      <dl className="grid gap-x-5 gap-y-3 text-sm sm:grid-cols-[130px_1fr]">
                        <dt className="text-muted-foreground">Team</dt>
                        <dd className="break-words">
                          {details.teamName} · {details.hometown}
                        </dd>
                        <dt className="text-muted-foreground">Contact</dt>
                        <dd className="break-words">
                          {details.firstName} {details.lastName} ·{" "}
                          {details.role}
                        </dd>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="break-all">{details.email}</dd>
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd>{details.phone}</dd>
                        {details.notes.trim() && (
                          <>
                            <dt className="text-muted-foreground">Notes</dt>
                            <dd className="break-words whitespace-pre-wrap">
                              {details.notes}
                            </dd>
                          </>
                        )}
                      </dl>
                    </ReviewSection>
                  </div>
                )
              }}
            </form.Subscribe>
            <Separator className="my-6" />
            <FieldSet>
              <FieldGroup>
                <form.AppField name="acknowledgements.rules">
                  {(field) => (
                    <field.AcknowledgementField>
                      <span>
                        I have reviewed the{" "}
                        <Link
                          to="/rules"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-4"
                        >
                          tournament rules
                        </Link>
                        .
                      </span>
                    </field.AcknowledgementField>
                  )}
                </form.AppField>
                <form.AppField name="acknowledgements.authorized">
                  {(field) => (
                    <field.AcknowledgementField>
                      I am authorized to register this team.
                    </field.AcknowledgementField>
                  )}
                </form.AppField>
              </FieldGroup>
            </FieldSet>
            <Navigation
              onBack={onBack}
              pending={pending || group.state.meta.isSubmitting}
              label={
                checkoutAvailable
                  ? "Continue to secure checkout"
                  : "Check registration details"
              }
            />
          </form>
        )}
      </form.FormGroup>
    )
  },
})

function ReviewSection({
  title,
  onEdit,
  disabled,
  children,
}: {
  title: string
  onEdit: () => void
  disabled: boolean
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          onClick={onEdit}
          disabled={disabled}
          aria-label={`Edit ${title.toLowerCase()}`}
        >
          <Pencil data-icon="inline-start" /> Edit
        </Button>
      </div>
      {children}
    </section>
  )
}
