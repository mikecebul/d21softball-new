import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BlarneyCastleVisit } from "@/components/blarney-castle-visit"
import { SectionHeading } from "@/components/shared"
import { BedDouble, MapPin, ExternalLink } from "lucide-react"

export const Route = createFileRoute("/visit")({ component: VisitPage })

function VisitPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        kicker="Plan the trip"
        title="Visit Petoskey"
        lede="Waterfront Park sits on Little Traverse Bay — sunsets behind the outfield fence, downtown a short walk away."
      />
      <div className="mt-8">
        <Card>
          <CardHeader className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-2">
              <BedDouble aria-hidden="true" className="size-7 text-primary" />
              <CardTitle>
                <h3>Where to stay</h3>
              </CardTitle>
            </div>
            <a
              href="https://petoskeyarea.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Petoskey Area (opens in a new tab)"
              className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <img
                src="/images/sponsors/petoskey_area_f8a18823a2.png"
                alt="Petoskey Area"
                width="463"
                height="147"
                className="h-auto w-56 max-w-full object-contain"
              />
            </a>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Please book hotel rooms well in advance of the summer softball
              season. For lodging information while attending D21 Softball
              events, explore the Petoskey Area listings of hotels and motels.
            </p>
            <Button
              render={
                <a
                  href="https://petoskeyarea.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
            >
              PetoskeyArea.com <ExternalLink data-icon="inline-end" />
            </Button>
          </CardContent>
        </Card>
      </div>
      <BlarneyCastleVisit />
      <div className="mt-8 rounded-xl bg-[var(--navy-deep)] p-6 text-white sm:p-8">
        <p className="flex items-center gap-1.5 font-condensed text-xs tracking-[0.22em] text-white/60 uppercase">
          <MapPin className="size-4" /> Getting to the park
        </p>
        <p className="mt-2 font-display text-2xl font-semibold uppercase">
          Waterfront Park, Petoskey MI
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
          District contact: Scott Kelly, 101 M-66 N, Charlevoix, MI 49720 —
          scott@d21softball.org — (231) 547-1144. Ample parking at the
          waterfront; arrive early Friday for the 7:00 PM first pitch.
        </p>
        <div className="mt-5 text-foreground">
          <Button
            variant="outline"
            render={
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Waterfront+Park+Petoskey+Michigan"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
          >
            <MapPin data-icon="inline-start" /> Directions to Waterfront Park
            <ExternalLink data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  )
}
