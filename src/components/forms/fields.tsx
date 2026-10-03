import type { ComponentProps, ReactNode } from "react"
import { useFieldContext } from "./form-context"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function errorMessages(errors: unknown[]) {
  return [
    ...new Set(
      errors.flatMap((error) => {
        if (typeof error === "string") return [error]
        if (
          error &&
          typeof error === "object" &&
          "message" in error &&
          typeof error.message === "string"
        )
          return [error.message]
        return []
      })
    ),
  ]
}

function fieldIds(name: string, invalid: boolean, description?: ReactNode) {
  return (
    [
      description ? `${name}-description` : undefined,
      invalid ? `${name}-error` : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined
  )
}

type TextFieldProps = Pick<
  ComponentProps<"input">,
  "type" | "placeholder" | "autoComplete" | "inputMode" | "maxLength"
> & {
  label: string
  description?: string
  optional?: boolean
}

export function TextField({
  label,
  description,
  optional,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>()
  const errors = errorMessages(field.state.meta.errors)
  const invalid = errors.length > 0
  return (
    <Field data-invalid={invalid}>
      <FieldLabel id={`${field.name}-label`} htmlFor={field.name}>
        {label}
        {optional && <span className="text-muted-foreground">(optional)</span>}
      </FieldLabel>
      <Input
        {...props}
        id={field.name}
        name={field.name}
        value={field.state.value}
        required={!optional}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={invalid}
        aria-describedby={fieldIds(field.name, invalid, description)}
        className="h-11"
      />
      {description && (
        <FieldDescription id={`${field.name}-description`}>
          {description}
        </FieldDescription>
      )}
      <FieldError id={`${field.name}-error`}>{errors.join(" ")}</FieldError>
    </Field>
  )
}

export function SelectField({
  label,
  options,
  description,
  optional,
  placeholder = "Select an option",
}: {
  label: string
  options: ReadonlyArray<{ value: string; label: string }>
  description?: string
  optional?: boolean
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = errorMessages(field.state.meta.errors)
  const invalid = errors.length > 0
  return (
    <Field data-invalid={invalid}>
      <FieldLabel id={`${field.name}-label`} htmlFor={field.name}>
        {label}
        {optional && <span className="text-muted-foreground">(optional)</span>}
      </FieldLabel>
      <Select
        name={field.name}
        value={field.state.value || null}
        items={options}
        onValueChange={(value) => field.handleChange(value ?? "")}
      >
        <SelectTrigger
          id={field.name}
          aria-labelledby={`${field.name}-label`}
          onBlur={field.handleBlur}
          aria-invalid={invalid}
          aria-describedby={fieldIds(field.name, invalid, description)}
          className="w-full data-[size=default]:h-11"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {optional && <SelectItem value="">Not provided</SelectItem>}
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {description && (
        <FieldDescription id={`${field.name}-description`}>
          {description}
        </FieldDescription>
      )}
      <FieldError id={`${field.name}-error`}>{errors.join(" ")}</FieldError>
    </Field>
  )
}

export function NotesField() {
  const field = useFieldContext<string>()
  const errors = errorMessages(field.state.meta.errors)
  const invalid = errors.length > 0
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>
        Notes <span className="text-muted-foreground">(optional)</span>
      </FieldLabel>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        maxLength={1000}
        rows={3}
        placeholder="Optional details for the commissioner."
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={invalid}
        aria-describedby={fieldIds(field.name, invalid)}
      />
      <FieldError id={`${field.name}-error`}>{errors.join(" ")}</FieldError>
    </Field>
  )
}

export function AcknowledgementField({ children }: { children: ReactNode }) {
  const field = useFieldContext<boolean>()
  const errors = errorMessages(field.state.meta.errors)
  const invalid = errors.length > 0
  return (
    <Field orientation="horizontal" data-invalid={invalid}>
      <Checkbox
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={field.handleChange}
        onBlur={field.handleBlur}
        aria-invalid={invalid}
        aria-labelledby={`${field.name}-label`}
        aria-describedby={fieldIds(field.name, invalid)}
      />
      <FieldContent>
        <FieldLabel id={`${field.name}-label`} htmlFor={field.name}>
          {children}
        </FieldLabel>
        <FieldError id={`${field.name}-error`}>{errors.join(" ")}</FieldError>
      </FieldContent>
    </Field>
  )
}
