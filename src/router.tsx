import { QueryClient } from "@tanstack/react-query"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { routeTree } from "./routeTree.gen"
import {
  payloadParseSearch,
  payloadStringifySearch,
} from "@payloadcms/tanstack-start/shared"

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 10 * 60 * 1000 },
    },
  })

  const router = createTanStackRouter({
    parseSearch: payloadParseSearch,
    routeTree,
    stringifySearch: payloadStringifySearch,
    context: { queryClient },

    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
