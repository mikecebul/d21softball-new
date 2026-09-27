import { useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const amenities = [
  "Quality branded gasoline: BP, Marathon, Mobil, Shell, Sunoco",
  "Fresh-brewed Java Mountain coffee",
  "Lucky Louie’s Pizza (in select stores)",
  "Bill and Will gourmet hot dogs (in select stores)",
  "Assorted deli items",
  "ATM services",
  "Great selection of beverages and snacks",
  "Java Mountain bakery products",
  "Beer, wine, and liquor in select stores",
  "Pre-paid cards",
  "EZ Mart Reloadable Gift Cards",
  "Campfire coffee — “As Bold As the Great Outdoors”",
  "Made In Michigan products",
]

export function BlarneyCastleVisit() {
  const [page, setPage] = useState(1)
  const directoryImage = `/images/visit/ez-mart-store-list-${page}.jpg`

  return (
    <section
      id="blarney-castle"
      aria-labelledby="blarney-heading"
      className="mt-10 scroll-mt-24 overflow-hidden rounded-xl border bg-card"
    >
      <div className="grid gap-6 border-b p-6 sm:p-8 md:grid-cols-[160px_1fr] md:items-center">
        <a
          href="https://blarneycastleoil.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Blarney Castle Oil & Propane (opens in a new tab)"
          className="w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <img
            src="/images/sponsors/BCOP_EZMART_LOGO_color_e170272370.jpg"
            alt="Blarney Castle Oil & Propane EZ Mart"
            width="432"
            height="432"
            loading="lazy"
            className="size-32 object-contain md:size-40"
          />
        </a>
        <div>
          <Badge variant="outline">Special sponsor · Fuel & convenience</Badge>
          <h2
            id="blarney-heading"
            className="mt-3 font-display text-3xl font-semibold uppercase sm:text-4xl"
          >
            Your stop before the first pitch
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Whether you need to fill up the vehicle, get some snacks, or find an
            ATM, Blarney Castle EZ Mart has what you need.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            render={
              <a
                href="https://blarneycastleoil.com/"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
          >
            Visit Blarney Castle <ExternalLink data-icon="inline-end" />
          </Button>
        </div>
      </div>
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_280px]">
        <div>
          <h3 className="font-display text-xl font-semibold uppercase">
            Fuel up. Stock up. Get back to the game.
          </h3>
          <ul className="mt-4 grid list-disc gap-x-8 gap-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-primary sm:grid-cols-2">
            {amenities.map((amenity) => (
              <li key={amenity}>{amenity}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-start gap-3 rounded-lg bg-muted p-5">
          <MapPin aria-hidden="true" className="size-6 text-primary" />
          <h3 className="font-display text-xl font-semibold uppercase">
            Stop in, right in Petoskey
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Visit the newest location on the south side of Petoskey at{" "}
            <strong className="text-foreground">807 Spring St.</strong>
          </p>
          <Button
            variant="outline"
            render={
              <a
                href="https://maps.app.goo.gl/ee2UJF8zVQ597zpM7"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
          >
            Get directions <ExternalLink data-icon="inline-end" />
          </Button>
        </div>
      </div>
      <div className="bg-muted/50 p-6 sm:p-8">
        <h3 className="font-display text-2xl font-semibold uppercase">
          Find an EZ Mart along the way
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore the locations map and browse all four pages of the store
          directory. Select an image to enlarge it.
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <h4>Michigan locations map</h4>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="/images/visit/ez-mart-map-2026.jpg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Enlarge the 2026 EZ Mart locations map (opens in a new tab)"
                className="block rounded-lg bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <img
                  src="/images/visit/ez-mart-map-2026.jpg"
                  alt="Blarney Castle EZ Mart locations across Michigan, from the Upper Peninsula to southwest Michigan"
                  width="1016"
                  height="1800"
                  loading="lazy"
                  className="h-96 w-full object-contain"
                />
              </a>
              <p className="mt-3 text-xs text-muted-foreground">
                2026 locations map
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                render={
                  <a
                    href="/images/visit/ez-mart-map-2026.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                nativeButton={false}
              >
                Open full map (PDF) <ExternalLink data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <h4>Store directory</h4>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={directoryImage}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Enlarge store directory page ${page} (opens in a new tab)`}
                className="block rounded-lg bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <img
                  src={directoryImage}
                  alt={`EZ Mart store directory, page ${page} of 4: store names, fuel brands, addresses, cities and phone numbers`}
                  width="1391"
                  height="1800"
                  loading="lazy"
                  className="h-96 w-full object-contain"
                />
              </a>
              <div className="mt-3 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Previous directory page"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft />
                </Button>
                <span
                  aria-live="polite"
                  className="text-xs text-muted-foreground"
                >
                  Page {page} of 4 · Updated May 2025
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Next directory page"
                  disabled={page === 4}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                render={
                  <a
                    href="/images/visit/ez-mart-store-list.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                nativeButton={false}
              >
                Open full directory (PDF){" "}
                <ExternalLink data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
