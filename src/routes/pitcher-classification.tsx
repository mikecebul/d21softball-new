import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { PitcherClassification } from "@/components/pitcher-classification"
import { SectionHeading } from "@/components/shared"

export const Route = createFileRoute("/pitcher-classification")({
  head: () => ({ meta: [{ title: "Pitcher Classification — D21 Softball" }] }),
  component: PitchersPage,
})

function PitchersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        kicker="USA Softball of Michigan"
        title="Pitcher classification"
        lede="The classification list and the people who oversee men's fastpitch eligibility in Michigan."
      />
      <PitcherClassification />
      <Link
        to="/rules"
        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4"
      >
        Equipment & tournament resources{" "}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
