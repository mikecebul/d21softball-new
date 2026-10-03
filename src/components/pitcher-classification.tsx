import { ExternalLink, FileText, Mail } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { pitcherClassification } from "@/lib/original-site-content"

export function PitcherClassification() {
  return (
    <section
      aria-labelledby="classification-heading"
      className="mt-8 flex flex-col gap-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id="classification-heading">{pitcherClassification.title}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Updated {pitcherClassification.updatedLabel}. Review the Michigan
            pitcher classifications when choosing a tournament and preparing
            your roster.
          </p>
          <a
            className={buttonVariants()}
            href={pitcherClassification.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText data-icon="inline-start" /> Open 2026 pitcher list (PDF)
            <ExternalLink data-icon="inline-end" />
          </a>
        </CardContent>
      </Card>
      <div>
        <h2 className="font-display text-2xl font-semibold uppercase">
          Fast Pitch Classification Committee Members
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableCaption className="pb-4">
              USA Softball of Michigan classification committee
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pitcherClassification.committee.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="min-w-48 whitespace-normal">
                    {member.position}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {member.location}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Questions about a classification or an appeal? Contact committee
          coordinator Scott Kelly for current guidance.
        </p>
        <a
          href="mailto:scott@d21softball.org?subject=Pitcher%20classification"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4"
        >
          <Mail className="size-4" aria-hidden="true" /> scott@d21softball.org
        </a>
      </div>
    </section>
  )
}
