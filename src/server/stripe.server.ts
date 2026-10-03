import Stripe from "stripe"
import { getPayload } from "payload"

export class CheckoutError extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message)
  }
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key || !/^(sk|rk)_(test|live)_/.test(key)) {
    throw new CheckoutError("Stripe checkout is not configured.", 503)
  }
  return new Stripe(key, {
    apiVersion: "2026-09-30.endive",
    maxNetworkRetries: 2,
  })
}

export function stripeIsLive() {
  return /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY?.trim() ?? "")
}

export async function getHistoryPayload() {
  const config = (await import("@payload-config")).default
  return getPayload({ config })
}

export function checkoutOrigin(request: Request) {
  const configured = process.env.SITE_URL?.trim()
  const url = new URL(configured || request.url)
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  if (!configured && !(import.meta.env.DEV && local)) {
    throw new CheckoutError("The checkout return URL is not configured.", 503)
  }
  if (
    url.protocol !== "https:" &&
    !(import.meta.env.DEV && local && url.protocol === "http:")
  ) {
    throw new CheckoutError("The checkout return URL must use HTTPS.", 503)
  }
  return url.origin
}

export function stripeFailure(error: unknown) {
  const failure = error as {
    code?: string
    decline_code?: string
    requestId?: string
  }
  return {
    code: failure.code ?? "checkout_error",
    declineCode: failure.decline_code,
    message:
      "Stripe checkout could not be created. Check server credentials and permissions.",
  }
}
