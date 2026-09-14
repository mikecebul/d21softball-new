import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  ChevronRight,
  ClipboardList,
  Compass,
  Flag,
  Mail,
  MapPin,
  Medal,
  Menu,
  Phone,
  Trophy,
  Users,
  X,
} from "lucide-react"

const nav = [
  { to: "/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/local-leagues", label: "Local Leagues", icon: Users },
  { to: "/hall-of-fame", label: "Hall of Fame", icon: Medal },
  { to: "/visit", label: "Visit", icon: Compass },
  { to: "/umpires", label: "Umpires", icon: Flag },
  { to: "/rules", label: "Rules", icon: ClipboardList },
]

const contactBar = {
  phone: "(231) 547-1144",
  email: "scott@d21softball.org",
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40">
      {/* contact bar */}
      <div className="bg-[var(--navy-deep)] text-white/85">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2 font-condensed text-xs tracking-[0.14em] uppercase">
          <span className="hidden sm:inline">Scott Kelly, District Commissioner —</span>
          <a
            href={`tel:${contactBar.phone.replace(/[^0-9]/g, "")}`}
            className="inline-flex items-center gap-1.5 hover:text-[var(--gold)]"
          >
            <Phone className="size-3.5" /> {contactBar.phone}
          </a>
          <span className="text-white/30">—</span>
          <a
            href={`mailto:${contactBar.email}`}
            className="inline-flex items-center gap-1.5 hover:text-[var(--gold)]"
          >
            <Mail className="size-3.5" /> {contactBar.email}
          </a>
        </div>
      </div>
      {/* main bar */}
      <div className="border-b bg-[var(--paper)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="D21 Softball logo" className="size-10" width={40} height={40} />
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold tracking-wide uppercase">
                D21 Softball
              </span>
              <span className="block text-xs text-muted-foreground">
                Fastpitch at the waterfront
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-muted text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
            <Link to="/register">
              <Button className="ml-2 font-semibold">Register for a tournament</Button>
            </Link>
          </nav>
          <button
            className="grid size-10 place-items-center rounded-md border lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
      {/* Mobile menu in a drawer (portaled + fixed) so opening it never shifts page layout */}
      <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
        <DrawerContent className="bg-[var(--paper)]">
          <div className="shrink-0 bg-[var(--navy-deep)] px-4 py-2">
            <p className="font-condensed text-[11px] font-semibold tracking-[0.22em] text-white/85 uppercase">
              District 21 Softball — Petoskey, Michigan
            </p>
          </div>
          <DrawerHeader className="flex-row items-center justify-between text-left">
            <DrawerTitle className="font-display text-4xl font-semibold">
              Menu
            </DrawerTitle>
            <DrawerClose
              render={
                <Button variant="ghost" size="icon" aria-label="Close menu" />
              }
            >
              <X className="size-5" />
            </DrawerClose>
          </DrawerHeader>
          <nav
            aria-label="Mobile"
            className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-4 py-2"
          >
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="group relative flex items-center gap-3 rounded-lg border-b border-foreground/8 py-2 pr-2 pl-3 last:border-0 hover:bg-muted data-[status=active]:border-transparent data-[status=active]:bg-[var(--sand)]"
              >
                <span
                  aria-hidden="true"
                  className="absolute top-2 bottom-2 left-1 hidden w-1 rounded-full bg-[var(--ember)] group-data-[status=active]:block"
                />
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[var(--navy)] text-white">
                  <n.icon className="size-5" />
                </span>
                <span className="flex-1 font-condensed text-xl font-semibold tracking-wide text-foreground uppercase">
                  {n.label}
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </nav>
          <div aria-hidden="true" className="shrink-0 px-6">
            <div className="border-t-2 border-dashed border-foreground/15" />
          </div>
          <DrawerFooter className="gap-3">
            <Link to="/register" onClick={() => setOpen(false)}>
              <Button size="lg" className="w-full font-semibold">
                Register for a tournament
              </Button>
            </Link>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <a
                href="mailto:scott@d21softball.org"
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <Mail className="size-3.5" /> scott@d21softball.org
              </a>
              <a
                href="tel:+12315471144"
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <Phone className="size-3.5" /> (231) 547-1144
              </a>
              <p className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" /> 101 M-66 N, Charlevoix, MI 49720
              </p>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </header>
  )
}
