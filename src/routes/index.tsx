import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowUpRight, MapPin, Trophy, Flag, ArrowRight } from "lucide-react"
import {
  SEASON_YEAR,
  formatDateRange,
  isCompleted,
  upcomingTournaments,
  spotsLeftFor,
} from "@/lib/data"
import { getSeasonTournaments } from "@/lib/tournaments"
import { SeasonNews } from "@/components/season-news"

export const Route = createFileRoute("/")({
  loader: () => getSeasonTournaments({ data: { year: SEASON_YEAR } }),
  component: HomePage,
})

function HomePage() {
  const tournaments = Route.useLoaderData()
  const upcoming = upcomingTournaments(tournaments)
  const seasonOver = upcoming.length === 0
  const displayed = (
    seasonOver
      ? [...tournaments].sort((a, b) => a.date_from.localeCompare(b.date_from))
      : upcoming
  ).slice(0, 5)
  return (
    <div className="field-guide">
      <section className="ballpark-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="little-star">✦</span> DISTRICT 21 • ANNUAL
            TOURNAMENTS
          </p>
          <h1>
            MEN’S
            <br />
            FASTPITCH.
            <br />
            <span>30+ YEARS.</span>
          </h1>
          <div className="hero-bottom">
            <p>
              More than 30 years of men’s fastpitch tournament tradition.
              <br />
              Hosted by District 21 at Waterfront Park in Petoskey.
              <br className="desktop-break" /> Find your tournament. Get your
              team in the game.
            </p>
            <a href="#schedule" className="field-button">
              Find your tournament <ArrowUpRight size={19} />
            </a>
          </div>
        </div>
        <div className="hero-photo">
          <img
            src="https://api.d21softball.org/uploads/Sunset_at_Waterfront_c7cb630f90.webp"
            alt="Fastpitch players on the field at Waterfront Park under a sunset sky"
            fetchPriority="high"
          />
          <div className="park-stamp">
            <strong>D21</strong>
            <span>
              FASTPITCH
              <br />
              PETOSKEY
            </span>
          </div>
          <div className="photo-caption">
            <span>
              <MapPin size={14} /> WATERFRONT PARK
            </span>
            <span>DISTRICT 21 SOFTBALL</span>
          </div>
        </div>
      </section>
      <div className="tradition-strip">
        <span>MEN’S FASTPITCH SOFTBALL</span>
        <span>✦</span>
        <span>ANNUAL TOURNAMENTS</span>
        <span>✦</span>
        <span>30+ YEARS OF TRADITION</span>
        <span>✦</span>
        <span>DISTRICT 21</span>
      </div>
      <section className="schedule-section guide-container" id="schedule">
        <div className="section-intro">
          <div>
            <p className="eyebrow">THE {SEASON_YEAR} TOURNAMENT SERIES</p>
            <h2>
              MAKE IT A<br />
              <span>SOFTBALL SUMMER.</span>
            </h2>
          </div>
          <div className="section-side">
            <p>
              {seasonOver
                ? "Another season at the waterfront, in the books. Explore the weekends, teams and tournament results."
                : "Get the team together. Pick your weekend. We’ll see you at the waterfront."}
            </p>
            <Link to="/tournaments" className="text-link">
              Full schedule & results <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="schedule-labels">
          <span>THE WEEKEND</span>
          <span>THE TOURNAMENT</span>
          <span>THE DETAILS</span>
        </div>
        <div className="tournament-lineup">
          {displayed.map((t, i) => (
            <Link
              className="tournament-row"
              key={t.slug}
              to="/tournaments/$slug"
              params={{ slug: t.slug }}
            >
              <div className="weekend-date">
                <span>
                  {new Date(t.date_from).toLocaleDateString("en-US", {
                    month: "short",
                    timeZone: "UTC",
                  })}
                </span>
                <strong>
                  {new Date(t.date_from).getUTCDate()}
                  <span>—</span>
                  {new Date(t.date_to).getUTCDate()}
                </strong>
              </div>
              <div className="tournament-name">
                <span className="row-number">
                  0{i + 1} / {t.class}
                </span>
                <h3>{t.name.replace(/2026/g, "").trim()}</h3>
                <p>
                  {formatDateRange(t.date_from, t.date_to)} ·{" "}
                  {t.location || "Waterfront Park, Petoskey"}
                </p>
              </div>
              <div className="tournament-action">
                <span>
                  {isCompleted(t)
                    ? "SEASON COMPLETE"
                    : `${spotsLeftFor(t)} SPOTS AVAILABLE`}
                </span>
                <strong>
                  {isCompleted(t)
                    ? "View tournament"
                    : t.price
                      ? `$${t.price} / team`
                      : "View details"}
                  <ArrowUpRight size={22} />
                </strong>
              </div>
            </Link>
          ))}
        </div>
        {displayed.length === 0 && (
          <p className="season-note">
            The next schedule is taking shape. Contact Scott Kelly at{" "}
            <a href="tel:+12315471144">(231) 547-1144</a> to plan your team’s
            weekend.
          </p>
        )}
        <div className="schedule-foot">
          <p>Check each tournament for its format, eligibility and details.</p>
          <Link to="/register" className="text-link">
            Team registration <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="waterfront-story">
        <div className="story-art">
          <img
            src="https://api.d21softball.org/uploads/Sunset_at_Waterfront_c7cb630f90.webp"
            alt="A softball game at Petoskey’s Waterfront Park in the evening light"
            loading="lazy"
          />
          <div className="story-art-caption">
            45°22′ N &nbsp; 84°57′ W<br />
            <strong>
              HOME FIELD.
              <br />
              UNREAL BACKDROP.
            </strong>
          </div>
        </div>
        <div className="story-copy">
          <p className="eyebrow">MORE THAN A PLACE TO PLAY</p>
          <h2>
            COME FOR
            <br />
            THE GAME.
            <br />
            <span>
              STAY FOR
              <br />
              THE WEEKEND.
            </span>
          </h2>
          <p>
            Lake Michigan beyond the outfield. Downtown just a short walk away.
            Bring your team, bring your family, and make a few memories between
            innings.
          </p>
          <Link to="/visit" className="field-button light-button">
            Explore Petoskey <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>
      <section className="guide-container clubhouse">
        <div className="section-intro">
          <div>
            <p className="eyebrow">AROUND THE DIAMOND</p>
            <h2>PART OF THE GAME.</h2>
          </div>
          <p className="clubhouse-note">
            The people, traditions and details
            <br />
            that keep D21 playing.
          </p>
        </div>
        <div className="clubhouse-grid">
          {[
            {
              to: "/local-leagues",
              icon: Flag,
              label: "01 / KEEP PLAYING",
              title: "Weeknights at the park",
              text: "Local leagues. Familiar faces. More time on the diamond.",
            },
            {
              to: "/hall-of-fame",
              icon: Trophy,
              label: "02 / OUR LEGACY",
              title: "Legends of the waterfront",
              text: "Meet the players and people who helped build the tradition.",
            },
            {
              to: "/rules",
              icon: MapPin,
              label: "03 / COME PREPARED",
              title: "Know before you throw",
              text: "Pitcher classifications, equipment and tournament rules.",
            },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="clubhouse-card">
              <div>
                <item.icon size={27} strokeWidth={1.4} />
                <ArrowUpRight size={21} />
              </div>
              <p className="eyebrow">{item.label}</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Link>
          ))}
        </div>
      </section>
      <SeasonNews />
      <section className="commissioner-note guide-container">
        <span className="little-star">✦</span>
        <div>
          <p className="eyebrow">A DIRECT LINE TO THE DIAMOND</p>
          <h2>LET’S TALK SOFTBALL.</h2>
          <p>
            Questions about your team or your next tournament? Scott Kelly,
            District Commissioner, is here to help.
          </p>
        </div>
        <a href="tel:+12315471144">
          (231) 547-1144 <ArrowUpRight size={23} />
        </a>
      </section>
    </div>
  )
}
