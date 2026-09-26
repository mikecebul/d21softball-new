import { useState } from "react"
import { ArrowUpRight, BookOpen, Medal, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { filterMembers } from "@/lib/hall-of-fame-data"
import type { HallOfFameMember, MemberSort } from "@/lib/hall-of-fame-data"

function MemberStory({ member }: { member: HallOfFameMember }) {
  if (!member.biography.length && !member.mediaUrl) {
    return member.articleUrl ? (
      <Button
        nativeButton={false}
        role="link"
        variant="ghost"
        size="sm"
        render={
          <a
            href={member.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
          />
        }
        aria-label={`Read article about ${member.name} (opens in a new tab)`}
      >
        Read article <ArrowUpRight data-icon="inline-end" />
      </Button>
    ) : null
  }
  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline" size="sm" />}
        aria-label={`Read about ${member.name}`}
      >
        <BookOpen data-icon="inline-start" /> Their story
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="pr-8">
          <DialogTitle>{member.name}</DialogTitle>
          <DialogDescription>
            {member.position} · {member.location} · Inducted {member.year}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm leading-relaxed">
          {member.biography.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          {member.mediaUrl && (
            <a
              href={member.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              View supporting material (opens in a new tab)
            </a>
          )}
          {member.articleUrl && (
            <a
              href={member.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Read the full article (opens in a new tab)
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function HallOfFameDirectory({
  members,
}: {
  members: HallOfFameMember[]
}) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState<MemberSort>("newest")
  const categories = [
    "all",
    ...Array.from(new Set(members.map((m) => m.position))).sort(),
  ]
  const visible = filterMembers(members, search, category, sort)
  const filtered = Boolean(search || category !== "all")
  const reset = () => {
    setSearch("")
    setCategory("all")
  }
  const sortItems = [
    { value: "newest", label: "Newest inductees" },
    { value: "oldest", label: "Earliest inductees" },
    { value: "name", label: "Name A–Z" },
  ]
  const categoryItems = categories.map((value) => ({
    value,
    label: value === "all" ? "All contributions" : value,
  }))

  return (
    <section
      id="honorees"
      aria-labelledby="honorees-heading"
      className="mt-12 scroll-mt-6"
    >
      <div className="mb-6 flex items-start gap-3">
        <Medal
          aria-hidden="true"
          className="mt-1 size-7 shrink-0 text-primary"
        />
        <div>
          <p className="font-condensed text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            District 21 honor roll
          </p>
          <h2
            id="honorees-heading"
            className="mt-1 font-display text-3xl font-semibold uppercase"
          >
            The people who made their mark
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Players, leaders and supporters recognized by the USA Softball of
            Michigan Hall of Fame.
          </p>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <FieldGroup className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <Field>
            <FieldLabel htmlFor="hof-search">Find an honoree</FieldLabel>
            <Input
              id="hof-search"
              type="search"
              placeholder="Search name, hometown or year…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="hof-category">Contribution</FieldLabel>
            <Select
              items={categoryItems}
              value={category}
              onValueChange={(value) => setCategory(value ?? "all")}
            >
              <SelectTrigger id="hof-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categoryItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="hof-sort">Sort by</FieldLabel>
            <Select
              items={sortItems}
              value={sort}
              onValueChange={(value) =>
                setSort((value ?? "newest") as MemberSort)
              }
            >
              <SelectTrigger id="hof-sort" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sortItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </div>
      <div className="flex min-h-14 items-center justify-between gap-4 py-3">
        <p role="status" className="text-sm text-muted-foreground">
          Showing {visible.length} of {members.length} honorees
        </p>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear filters
          </Button>
        )}
      </div>
      {visible.length ? (
        <>
          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <Table aria-label="District 21 Hall of Fame members">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28 px-5">Inducted</TableHead>
                  <TableHead>Honoree</TableHead>
                  <TableHead>Contribution</TableHead>
                  <TableHead>Hometown</TableHead>
                  <TableHead className="px-5">
                    <span className="sr-only">Stories and articles</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="px-5 py-5">
                      <span className="font-display text-2xl font-semibold text-primary tabular-nums">
                        {member.year}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-72 whitespace-normal">
                      <span className="font-semibold">{member.name}</span>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {member.position}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {member.location}
                    </TableCell>
                    <TableCell className="px-5 text-right">
                      <MemberStory member={member} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ul
            aria-label="District 21 Hall of Fame members"
            className="overflow-hidden rounded-xl border bg-card md:hidden"
          >
            {visible.map((member) => (
              <li
                key={member.id}
                className="flex gap-4 border-b p-4 last:border-0"
              >
                <div className="w-14 shrink-0 border-r pr-3">
                  <span className="font-display text-2xl font-semibold text-primary tabular-nums">
                    {member.year}
                  </span>
                  <span className="mt-1 block text-[10px] text-muted-foreground uppercase">
                    Inducted
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                  <h3 className="leading-snug font-semibold">{member.name}</h3>
                  <p className="text-sm">{member.position}</p>
                  <p className="mb-1 text-sm text-muted-foreground">
                    {member.location}
                  </p>
                  <MemberStory member={member} />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <Empty className="border bg-card py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>
              {members.length
                ? "No honorees match your search"
                : "The honor roll is being updated"}
            </EmptyTitle>
            <EmptyDescription>
              {members.length
                ? "Try a different name, hometown or contribution."
                : "Check back soon for the Hall of Fame member list."}
            </EmptyDescription>
          </EmptyHeader>
          {filtered && (
            <EmptyContent>
              <Button variant="outline" onClick={reset}>
                Clear filters
              </Button>
            </EmptyContent>
          )}
        </Empty>
      )}
    </section>
  )
}
