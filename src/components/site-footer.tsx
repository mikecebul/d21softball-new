import { Link } from "@tanstack/react-router";
import { sponsors } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Share2 } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-[var(--navy-deep)] text-white">
      {/* sponsors */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="font-condensed text-xs tracking-[0.22em] uppercase text-white/60">
            Summer series sponsors
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
              >
                <p className="text-sm font-semibold">{s.name}</p>
                <p className="text-xs text-white/60">{s.blurb}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
      {/* main footer */}
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-semibold tracking-wide uppercase">
            D21 Softball
          </p>
          <p className="mt-2 max-w-sm text-sm text-white/70">
            Men's fastpitch tournaments at Waterfront Park, Petoskey — Little
            Traverse Bay behind the outfield fence, sunsets included.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <span className="font-semibold text-white/90">District Commissioner — Scott Kelly</span>
            <a href="mailto:scott@d21softball.org" className="inline-flex items-center gap-2 text-white/75 hover:text-white">
              <Mail className="size-4" /> scott@d21softball.org
            </a>
            <a href="tel:+12315471144" className="inline-flex items-center gap-2 text-white/75 hover:text-white">
              <Phone className="size-4" /> (231) 547-1144
            </a>
            <a
              href="https://goo.gl/maps/PSj6Do1ttGzjpCkj9"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-white/75 hover:text-white"
            >
              <MapPin className="size-4" /> 101 M-66 N, Charlevoix, MI 49720
            </a>
          </div>
        </div>
        <div>
          <p className="font-condensed text-xs tracking-[0.22em] uppercase text-white/60">
            Play
          </p>
          <div className="mt-3 grid gap-2 text-sm">
            <Link to="/tournaments" className="text-white/75 hover:text-white">2026 Tournaments</Link>
            <Link to="/register" className="text-white/75 hover:text-white">Register for a tournament</Link>
            <Link to="/archives" className="text-white/75 hover:text-white">Archives & results</Link>
            <Link to="/local-leagues" className="text-white/75 hover:text-white">Local leagues</Link>
            <Link to="/hall-of-fame" className="text-white/75 hover:text-white">Hall of Fame</Link>
          </div>
        </div>
        <div>
          <p className="font-condensed text-xs tracking-[0.22em] uppercase text-white/60">
            Know before you go
          </p>
          <div className="mt-3 grid gap-2 text-sm">
            <Link to="/rules" className="text-white/75 hover:text-white">Pitcher classification & bats</Link>
            <Link to="/umpires" className="text-white/75 hover:text-white">Umpire registration</Link>
            <Link to="/visit" className="text-white/75 hover:text-white">Lodging & fuel</Link>
            <a href="https://www.usasoftballmi.org" target="_blank" rel="noreferrer" className="text-white/75 hover:text-white">
              USA Softball of Michigan
            </a>
            <a
              href="https://www.facebook.com/groups/127657947314063"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-white/75 hover:text-white"
            >
              <Share2 className="size-4" /> D21 Softball at Petoskey
            </a>
          </div>
        </div>
      </div>
      <Separator className="bg-white/10" />
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-white/55 sm:flex-row sm:items-center">
        <p>© 2026 D21 Softball. All rights reserved.</p>
        <p>Fastpitch on Little Traverse Bay — Petoskey, Michigan.</p>
      </div>
    </footer>
  );
}
