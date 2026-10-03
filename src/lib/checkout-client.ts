import type { RegistrationSubmission } from "./registration"

const CHECKOUT_DRAFT_KEY = "d21.checkout-request.v1"
let pendingRequest: { fingerprint: string; submissionKey: string } | undefined

export function clearCheckoutRequest() {
  pendingRequest = undefined
  try {
    sessionStorage.removeItem(CHECKOUT_DRAFT_KEY)
  } catch {
    /* Storage is optional. */
  }
}

export async function registrationCheckout(submission: RegistrationSubmission) {
  const fingerprint = JSON.stringify(submission)
  let submissionKey =
    pendingRequest?.fingerprint === fingerprint
      ? pendingRequest.submissionKey
      : crypto.randomUUID()
  try {
    const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY)
    const previous = raw ? JSON.parse(raw) : undefined
    if (
      previous?.fingerprint === fingerprint &&
      typeof previous.submissionKey === "string"
    )
      submissionKey = previous.submissionKey
    sessionStorage.setItem(
      CHECKOUT_DRAFT_KEY,
      JSON.stringify({ fingerprint, submissionKey })
    )
  } catch {
    /* Checkout still works when browser storage is unavailable. */
  }
  pendingRequest = { fingerprint, submissionKey }
  const response = await fetch("/api/registration/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submissionKey, submission }),
  })
  const result = (await response.json()) as { url?: string; error?: string }
  if (!response.ok || !result.url)
    throw new Error(result.error ?? "Checkout could not start. Please retry.")
  const url = new URL(result.url)
  if (
    url.origin !== window.location.origin &&
    !(url.protocol === "https:" && url.hostname === "checkout.stripe.com")
  )
    throw new Error("The checkout URL is invalid.")
  window.location.assign(url.href)
}
