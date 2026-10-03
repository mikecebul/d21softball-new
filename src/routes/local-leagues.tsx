import { createFileRoute } from "@tanstack/react-router"
import {
  CalendarDays,
  ExternalLink,
  FileText,
  Image,
  Mail,
  MapPin,
  Phone,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionHeading } from "@/components/shared"
import { leagueDirectory } from "@/lib/original-site-content"

export const Route = createFileRoute("/local-leagues")({
  component: LeaguesPage,
})

function LeaguesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        kicker="Around District 21"
        title="Local leagues"
        lede="Find a league, contact its organizer, and browse schedules, final standings, statistics and champion photos."
      />
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
        {leagueDirectory.map((league) => (
          <Card key={league.id}>
            <CardHeader>
              <CardTitle>
                <h2>{league.name}</h2>
              </CardTitle>
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" aria-hidden="true" />
                {league.location}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {league.nights && (
                <p className="inline-flex items-center gap-2 text-sm">
                  <CalendarDays
                    className="size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {league.nights} · Mid-June to early August
                </p>
              )}
              <div className="flex flex-col gap-2 text-sm">
                <p className="font-semibold">
                  {league.contactName}
                  {league.contactPosition && (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · {league.contactPosition}
                    </span>
                  )}
                </p>
                <a
                  href={`tel:+1${league.phone.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-2 hover:underline"
                >
                  <Phone className="size-4 text-primary" aria-hidden="true" />
                  {league.phone}
                </a>
                <a
                  href={`mailto:${league.email}`}
                  className="inline-flex items-center gap-2 break-all hover:underline"
                >
                  <Mail
                    className="size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {league.email}
                </a>
              </div>
              <a
                className={buttonVariants({
                  variant: "outline",
                  className: "w-fit",
                })}
                href={`mailto:${league.email}`}
              >
                Contact the league
              </a>
              {league.resources.length > 0 ? (
                <div>
                  <h3 className="font-display text-lg font-semibold uppercase">
                    Schedules & league history
                  </h3>
                  <ul className="mt-3 flex flex-col divide-y">
                    {league.resources.map((resource) => (
                      <li key={resource.id}>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-3 py-3 text-sm hover:text-primary"
                        >
                          {resource.format === "PDF" ? (
                            <FileText
                              className="mt-0.5 size-4 shrink-0 text-primary"
                              aria-hidden="true"
                            />
                          ) : (
                            <Image
                              className="mt-0.5 size-4 shrink-0 text-primary"
                              aria-hidden="true"
                            />
                          )}
                          <span className="flex-1">
                            <span className="group-hover:underline">
                              {resource.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {resource.format} · Opens in a new tab
                            </span>
                          </span>
                          <ExternalLink
                            className="mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Contact Robert Crick for current schedules and information
                  about joining the East Jordan co-ed league.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        The latest league schedules published by D21 are from 2025. Contact the
        league organizer for the current season's schedule.
      </p>
    </div>
  )
}
