import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/motel")({
  beforeLoad: () => {
    throw redirect({ to: "/visit", statusCode: 301 })
  },
})
