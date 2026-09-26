import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { sponsors } from "@/lib/data"
import type { Sponsor } from "@/lib/data"

function SponsorMark({ sponsor }: { sponsor: Sponsor }) {
  const [failed, setFailed] = useState(false)
  return (
    <>
      <div className="flex h-24 w-full items-center justify-center px-3">
        {sponsor.logo && !failed ? (
          <img
            src={sponsor.logo}
            alt={`${sponsor.name} logo`}
            loading="lazy"
            className="max-h-24 max-w-full object-contain"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="font-display text-2xl font-semibold">
            {sponsor.name}
          </span>
        )}
      </div>
      <span className="mt-4 flex items-center justify-center gap-1 text-center text-xs font-semibold">
        {sponsor.name}
        {sponsor.url && (
          <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
        )}
      </span>
    </>
  )
}

export function SponsorShowcase() {
  return (
    <section
      aria-labelledby="sponsors-heading"
      className="sponsor-showcase border-t-4 border-[var(--gold)] bg-[var(--sand)] text-foreground"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-condensed text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Our community. Our supporters.
            </p>
            <h2
              id="sponsors-heading"
              className="mt-2 font-display text-3xl font-semibold uppercase"
            >
              The businesses behind the game
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Thank you to the sponsors who support District 21 softball.
              Support them when you’re in town.
            </p>
          </div>
          <a
            href="mailto:scott@d21softball.org?subject=D21%20Softball%20sponsorship"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold underline decoration-primary/40 underline-offset-4 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Become a sponsor{" "}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {sponsors.map((sponsor) => (
            <li key={sponsor.name} className="min-w-0">
              {sponsor.url ? (
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${sponsor.name} (opens in a new tab)`}
                  className="sponsor-tile flex h-full flex-col items-center justify-center rounded-xl border bg-white px-3 py-5 transition hover:border-primary hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <SponsorMark sponsor={sponsor} />
                </a>
              ) : (
                <div className="sponsor-tile flex h-full flex-col items-center justify-center rounded-xl border bg-white px-3 py-5">
                  <SponsorMark sponsor={sponsor} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
