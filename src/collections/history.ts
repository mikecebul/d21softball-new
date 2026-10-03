import { randomUUID } from "node:crypto"
import { isDeepStrictEqual } from "node:util"
import { APIError } from "payload"
import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
} from "payload"

// Users are CMS staff; tournament entrants never receive accounts.
export const readHistory: Access = ({ req }) => Boolean(req.user)
export const denyHistoryMutation: Access = () => false
export const historyAccess = {
  read: readHistory,
  readVersions: readHistory,
  create: denyHistoryMutation,
  update: denyHistoryMutation,
  delete: denyHistoryMutation,
}

export const newHistoryKey = () => randomUUID()
export const timestamp = () => new Date().toISOString()

export const minorUnits = (
  value: unknown,
  options: { required?: boolean } = {}
) => {
  if (value === undefined || value === null)
    return options.required ? "An amount in cents is required." : true
  return (
    (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) ||
    "Use a non-negative whole number of cents."
  )
}

export const positiveInteger = (value: unknown) =>
  (typeof value === "number" && Number.isSafeInteger(value) && value >= 1) ||
  "Use a positive whole number."

export const currencyCode = (value: unknown) =>
  (typeof value === "string" && /^[a-z]{3}$/.test(value)) ||
  "Use a lowercase three-letter currency code, such as usd."

export const accepted = (value: unknown) =>
  value === true || "Acknowledgment is required."

export function immutableHistoryFields(
  fields: string[]
): CollectionBeforeChangeHook {
  return ({ data, originalDoc, operation }) => {
    if (operation !== "update" || !originalDoc) return data
    for (const field of fields) {
      if (!Object.prototype.hasOwnProperty.call(data, field)) continue
      const incoming =
        field === "submission" ? relationshipID(data[field]) : data[field]
      const previous =
        field === "submission"
          ? relationshipID(originalDoc[field])
          : originalDoc[field]
      if (
        !isDeepStrictEqual(persistedValue(incoming), persistedValue(previous))
      ) {
        throw new APIError(
          `The original ${field} cannot be changed on a history record.`,
          400
        )
      }
    }
    return data
  }
}

// Payload expands optional group fields during updates. Missing and undefined
// properties represent the same stored answer; dates also have two representations.
function persistedValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(persistedValue)
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .map(([key, child]) => [key, persistedValue(child)])
    )
  }
  return value
}

function relationshipID(value: unknown) {
  return value && typeof value === "object" && "id" in value ? value.id : value
}

export const validatePaymentTotals: CollectionBeforeValidateHook = ({
  data,
  originalDoc,
}) => {
  const payment = { ...originalDoc, ...data }
  const received = payment.amountReceived ?? 0
  const refunded = payment.amountRefunded ?? 0
  const refunds: { stripeRefundId: string; amount: number; status: string }[] =
    payment.refunds ?? []
  if (
    new Set(refunds.map((refund) => refund.stripeRefundId)).size !==
    refunds.length
  ) {
    throw new APIError(
      "A Stripe refund must only appear once on a payment.",
      400
    )
  }
  const succeededRefunds = refunds
    .filter((refund) => refund.status === "succeeded")
    .reduce((sum, refund) => sum + refund.amount, 0)
  if (succeededRefunds !== refunded)
    throw new APIError(
      "The refunded total must match the successful refund records.",
      400
    )
  if (refunded > received)
    throw new APIError("Refunds cannot exceed the amount received.", 400)
  if (
    ["succeeded", "partially_refunded", "refunded"].includes(payment.status)
  ) {
    if (received !== payment.amountExpected)
      throw new APIError(
        "A successful payment must match the expected amount.",
        400
      )
  }
  if (payment.status === "succeeded" && refunded !== 0) {
    throw new APIError(
      "Use a refunded status when a successful payment has been refunded.",
      400
    )
  }
  if (
    payment.status === "partially_refunded" &&
    !(refunded > 0 && refunded < received)
  ) {
    throw new APIError(
      "A partial refund must be greater than zero and less than the amount received.",
      400
    )
  }
  if (
    payment.status === "refunded" &&
    !(received > 0 && refunded === received)
  ) {
    throw new APIError(
      "A fully refunded payment must refund the entire amount received.",
      400
    )
  }
  return data
}

export const preserveStripeIdentifiers: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
}) => {
  if (
    operation !== "update" ||
    !originalDoc?.stripe ||
    !Object.prototype.hasOwnProperty.call(data, "stripe")
  )
    return data
  for (const field of [
    "checkoutSessionId",
    "paymentIntentId",
    "customerId",
    "accountId",
  ]) {
    if (
      originalDoc.stripe[field] &&
      (!data.stripe ||
        Object.prototype.hasOwnProperty.call(data.stripe, field)) &&
      data.stripe?.[field] !== originalDoc.stripe[field]
    ) {
      throw new APIError(
        `The Stripe ${field} cannot be replaced on a payment attempt.`,
        400
      )
    }
  }
  return data
}
