import { Maximize2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { HallOfFamePhoto } from "@/lib/hall-of-fame-data"

export function HallOfFameGallery({ photos }: { photos: HallOfFamePhoto[] }) {
  if (!photos.length) return null
  return (
    <section aria-labelledby="hof-photos-heading" className="mt-10">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2
          id="hof-photos-heading"
          className="font-display text-2xl font-semibold uppercase"
        >
          Moments worth remembering
        </h2>
        <span className="hidden text-xs text-muted-foreground sm:block">
          Select a photo to take a closer look
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {photos.map((photo) => (
          <Dialog key={photo.src}>
            <figure className="overflow-hidden rounded-xl border bg-card">
              <DialogTrigger
                className="group relative block w-full cursor-zoom-in bg-[var(--navy-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label={`Enlarge photo: ${photo.caption}`}
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  width={photo.width}
                  height={photo.height}
                  className="aspect-[2/1] w-full object-contain"
                />
                <span className="absolute right-3 bottom-3 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground transition group-hover:bg-background">
                  <Maximize2 className="size-4" aria-hidden="true" />
                </span>
              </DialogTrigger>
              <figcaption className="px-4 py-4 text-sm leading-relaxed">
                {photo.caption}
              </figcaption>
            </figure>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-5xl">
              <DialogHeader className="pr-8">
                <DialogTitle>Hall of Fame gallery</DialogTitle>
                <DialogDescription>{photo.caption}</DialogDescription>
              </DialogHeader>
              <img
                src={photo.src}
                alt={photo.caption}
                width={photo.width}
                height={photo.height}
                className="max-h-[70dvh] w-full object-contain"
              />
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </section>
  )
}
