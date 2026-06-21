import { Reveal } from "@/components/ui/Reveal";
import { WORK } from "@/lib/constants";
import { WorkCard } from "./WorkCard";

/** Per-column reveal delay for the staggered grid entrance (seconds). */
const STAGGER_DELAY_SECONDS = 0.1;

/**
 * 2-up project grid. Each card slides in with a small Y rise; even
 * columns get a 0s delay, odd columns get +0.1s for the staggered feel.
 * Server component — `<Reveal>` is the only interactive piece, and
 * the hover lift is pure Tailwind on `<WorkCard>` itself.
 */
export function Work(): React.ReactElement {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="relative px-4 py-32 sm:px-8 sm:py-48"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-16 flex items-end justify-between gap-4">
            <h2
              id="work-heading"
              className="text-balance text-[clamp(32px,4.6vw,60px)] font-medium tracking-[-0.03em] text-fg"
            >
              Selected work
            </h2>
            <span className="hidden text-sm text-muted sm:inline">
              {WORK.length.toString().padStart(2, "0")} projects
            </span>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {WORK.map((work, index) => (
            <Reveal
              key={work.slug}
              y={32}
              delay={(index % 2) * STAGGER_DELAY_SECONDS}
            >
              <WorkCard work={work} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
