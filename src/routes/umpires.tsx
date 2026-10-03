import { createFileRoute } from "@tanstack/react-router"
import { ExternalLink, FileText, Mail, Phone } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionHeading } from "@/components/shared"
import { umpireResources } from "@/lib/original-site-content"

export const Route = createFileRoute("/umpires")({ component: UmpiresPage })

function UmpiresPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        kicker="Behind the plate"
        title="Umpire with D21"
        lede="Interested in umpiring? Find registration instructions and the official USA Softball of Michigan umpire resources."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Umpire registration instructions</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Download the registration packet available on the original D21
              website.
            </p>
            <a
              href={umpireResources.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              <FileText data-icon="inline-start" /> Registration instructions
              (PDF)
            </a>
            <p className="text-xs leading-relaxed text-muted-foreground">
              This packet dates from {umpireResources.registrationYear}. Confirm
              current registration requirements and clinic dates with USA
              Softball of Michigan.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>USA Softball of Michigan umpires</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Visit the state umpire information page for current registration,
              training and program information.
            </p>
            <a
              href={umpireResources.informationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants()}
            >
              Michigan umpire information{" "}
              <ExternalLink data-icon="inline-end" />
            </a>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 rounded-xl border bg-card p-6">
        <h2 className="font-display text-2xl font-semibold uppercase">
          Work the waterfront
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Contact District Commissioner Scott Kelly with questions about
          umpiring District 21 tournaments and your weekend availability.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="mailto:scott@d21softball.org?subject=D21%20umpiring"
            className={buttonVariants({ variant: "outline" })}
          >
            <Mail data-icon="inline-start" /> Contact Scott Kelly
          </a>
          <a
            href="tel:+12315471144"
            className={buttonVariants({ variant: "outline" })}
          >
            <Phone data-icon="inline-start" /> (231) 547-1144
          </a>
        </div>
      </div>
    </div>
  )
}
