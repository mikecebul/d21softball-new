import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

export const getRegistrationStatus = createServerFn({ method: "GET" })
  .validator(
    z.object({
      sessionId: z
        .string()
        .regex(/^cs_(test_)?[a-zA-Z0-9]+$/)
        .max(300),
    })
  )
  .handler(async ({ data }) => {
    const { getHistoryPayload } = await import("@/server/stripe.server")
    const payload = await getHistoryPayload()
    const result = await payload.find({
      collection: "payments",
      where: { "stripe.checkoutSessionId": { equals: data.sessionId } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    const payment = result.docs.at(0)
    if (!payment) return { status: "unknown" as const }
    const submissionId =
      typeof payment.submission === "string"
        ? payment.submission
        : payment.submission.id
    const entry = await payload.findByID({
      collection: "form-submissions",
      id: submissionId,
      depth: 0,
      overrideAccess: true,
    })
    return {
      status:
        entry.status === "confirmed"
          ? ("confirmed" as const)
          : ("pending" as const),
      tournament: entry.tournament.name,
      paymentStatus: payment.status,
      livemode: payment.livemode,
    }
  })
