import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "D21 Softball — Fastpitch at the Waterfront, Petoskey MI" },
      {
        name: "description",
        content:
          "District 21 Softball: men's fastpitch tournaments at Waterfront Park in Petoskey, Michigan. Register for a tournament, browse brackets and archives.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: () => (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="font-condensed text-xs tracking-[0.22em] text-primary uppercase">Lost in the outfield</p>
      <h1 className="font-display mt-2 text-5xl font-semibold uppercase">404</h1>
      <p className="text-muted-foreground mt-3">That page went foul. Head back to the park.</p>
      <a href="/" className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
        Back to home
      </a>
    </main>
  ),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen antialiased">
        <SiteHeader />
        <main className="min-h-[60vh]">{children}</main>
        <SiteFooter />
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  );
}
