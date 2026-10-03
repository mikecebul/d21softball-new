import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/umpire")({
  beforeLoad: () => {
    throw redirect({ to: "/umpires", statusCode: 301 })
  },
})
