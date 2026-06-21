import { Reveal } from "@/components/ui/Reveal";
import { WORK } from "@/lib/constants";
import { WorkCard } from "./WorkCard";

const STAGGER_DELAY_SECONDS = 0.1;

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
