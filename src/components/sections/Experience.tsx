import { Reveal } from "@/components/ui/Reveal";
import { EXPERIENCE } from "@/lib/constants";
import { ExperienceRow } from "./ExperienceRow";

/**
 * Timeline section — chronological rows pulled straight from `EXPERIENCE`.
 * Renders nothing past the section heading when the constant is empty
 * so the layout doesn't show a hollow "Experience" header with an
 * empty list beneath.
 */
export function Experience(): React.ReactElement {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative px-4 py-32 sm:px-8 sm:py-48"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-12 flex items-end justify-between gap-4">
            <h2
              id="experience-heading"
              className="text-balance text-[clamp(32px,4.6vw,60px)] font-medium tracking-[-0.03em] text-fg"
            >
              Experience
            </h2>
            <span className="hidden text-sm text-muted sm:inline">
              {EXPERIENCE.length.toString().padStart(2, "0")} positions
            </span>
          </div>
        </Reveal>

        {EXPERIENCE.length === 0 ? (
          <p className="text-fg-2">More to come.</p>
        ) : (
          <div role="list" className="border-t border-line">
            {EXPERIENCE.map((row, index) => (
              <Reveal key={`${row.company}-${row.period}`} y={20} delay={index * 0.05}>
                <ExperienceRow row={row} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
