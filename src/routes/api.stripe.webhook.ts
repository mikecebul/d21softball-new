import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { receiveWebhook } = await import("@/server/webhook.server")
        try {
          return await receiveWebhook(request)
        } catch {
          return Response.json(
            { error: "Webhook processing failed. Retry." },
            { status: 503 }
          )
        }
      },
    },
  },
})
