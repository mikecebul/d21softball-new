import { Link } from "@tanstack/react-router"
import { ArrowUpRight, ExternalLink, FileText } from "lucide-react"
import {
  equipmentResources,
  facebookUrl,
  pitcherClassification,
  stateChampionships,
  umpireResources,
} from "@/lib/original-site-content"

export function SeasonNews() {
  const resources = [
    {
      title: "2026 pitcher classification list",
      description: `Updated ${pitcherClassification.updatedLabel}.`,
      url: pitcherClassification.url,
    },
    {
      title: "Certified equipment & banned bats",
      description: "Check the current USA Softball equipment directory.",
      url: equipmentResources.certifiedUrl,
    },
    {
      title: "Archived banned bat list (PDF)",
      description: "The historical document published on D21.",
      url: equipmentResources.archivedBatListUrl,
    },
    {
      title: "Umpire registration instructions",
      description:
        "Original registration packet (2017); confirm current requirements.",
      url: umpireResources.registrationUrl,
    },
  ]
  return (
    <section className="guide-container py-16" aria-labelledby="news-heading">
      <div className="section-intro">
        <div>
          <p className="eyebrow">FROM THE COMMISSIONER</p>
          <h2 id="news-heading">NEWS & UPDATES.</h2>
        </div>
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          Follow scores & photos <ArrowUpRight size={17} />
        </a>
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <article className="flex flex-col items-start gap-4">
          <p className="eyebrow">
            <time dateTime="2026-01-16">JANUARY 16, 2026 · SEASON NEWS</time>
          </p>
          <h3 className="font-display text-3xl font-semibold uppercase">
            Another summer at the waterfront
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Scott Kelly's season announcement welcomes five weekends of men's
            fastpitch to Petoskey, including the late-August Class B State
            Finals. The summer invitationals typically feature five-team round
            robins with a four-game guarantee.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A typical weekend starts Friday at 7 PM, resumes Saturday at 9 or 10
            AM, and finishes with Sunday games from 8 AM and a championship
            around noon. Check each tournament's bracket for its actual
            schedule.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Game scores, completed scorebooks, champion and runner-up photos,
            and individual awards are shared in the D21 Softball at Petoskey
            Facebook group.
          </p>
          <Link to="/tournaments" className="text-link">
            See the season & brackets <ArrowUpRight size={17} />
          </Link>
          <div className="mt-2 w-full border-t pt-5">
            <h3 className="font-display text-xl font-semibold uppercase">
              2026 Michigan state championships
            </h3>
            <ul className="mt-3 flex flex-col gap-3 text-sm">
              {stateChampionships.map((event) => (
                <li key={event.division}>
                  <strong>
                    {event.division} · {event.location}
                  </strong>
                  <span className="block text-muted-foreground">
                    {event.dates} · {event.format}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Dates from the season announcement. Consult the tournament bracket
              for confirmed game dates and times.
            </p>
          </div>
        </article>
        <div className="flex flex-col">
          <h3 className="font-display text-3xl font-semibold uppercase">
            Before you play
          </h3>
          <ul className="mt-4 flex flex-col divide-y border-y">
            {resources.map((resource) => (
              <li key={resource.url}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 py-5"
                >
                  <FileText
                    className="mt-1 size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="flex-1">
                    <span className="block font-semibold group-hover:underline">
                      {resource.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {resource.description}
                    </span>
                  </span>
                  <ExternalLink
                    className="mt-1 size-4 shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
          <Link to="/pitcher-classification" className="text-link mt-5">
            Meet the classification committee <ArrowUpRight size={17} />
          </Link>
          <Link to="/umpires" className="text-link mt-3">
            Umpiring at D21 <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}
