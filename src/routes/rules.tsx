import { createFileRoute } from "@tanstack/react-router"
import { Ban, ExternalLink, FileText } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PitcherClassification } from "@/components/pitcher-classification"
import { SectionHeading } from "@/components/shared"
import { equipmentResources } from "@/lib/original-site-content"

export const Route = createFileRoute("/rules")({ component: RulesPage })

function RulesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        kicker="Eligibility & equipment"
        title="Rules & classification"
        lede="Review pitcher classifications and official equipment resources before your tournament weekend."
      />
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-2">
              <Ban className="size-6 text-primary" aria-hidden="true" />{" "}
              Certified equipment & bats
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Use USA Softball's certified-equipment directory for current
            approved and non-approved bat lists. The historical bat document
            shared on the original D21 site is also available below.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              className={buttonVariants()}
              href={equipmentResources.certifiedUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Current certified equipment{" "}
              <ExternalLink data-icon="inline-end" />
            </a>
            <a
              className={buttonVariants({ variant: "outline" })}
              href={equipmentResources.archivedBatListUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText data-icon="inline-start" /> Archived banned bat list
              (PDF)
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            The archived list was last published in{" "}
            {equipmentResources.archivedBatListYear}; check the official
            directory for current eligibility.
          </p>
        </CardContent>
      </Card>
      <PitcherClassification />
    </div>
  )
}
