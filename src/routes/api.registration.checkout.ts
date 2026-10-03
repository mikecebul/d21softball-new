import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/registration/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { startCheckout } = await import("@/server/checkout.server")
        const { CheckoutError } = await import("@/server/stripe.server")
        try {
          const body = await request.text()
          if (body.length > 16000)
            return Response.json(
              { error: "Registration is too large." },
              { status: 413 }
            )
          let data: unknown
          try {
            data = JSON.parse(body)
          } catch {
            return Response.json(
              { error: "Invalid registration." },
              { status: 400 }
            )
          }
          return Response.json(await startCheckout(data, request), {
            headers: { "Cache-Control": "no-store" },
          })
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof CheckoutError
                  ? error.message
                  : "Registration could not be saved. Please try again.",
            },
            { status: error instanceof CheckoutError ? error.status : 500 }
          )
        }
      },
    },
  },
})
