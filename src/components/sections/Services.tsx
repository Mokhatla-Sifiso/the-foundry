import { Reveal } from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/constants";
import { ServiceCard } from "./ServiceCard";

/** Top offset (px) for the first sticky card — clears the pill nav. */
const TOP_BASE_PX = 88;
/** Each subsequent card sticks this many px lower than the previous. */
const TOP_STEP_PX = 18;

/**
 * Stacking dark cards built on plain CSS `position: sticky`. Each card
 * sticks at progressively lower positions; solid card backgrounds mean
 * a later card visually covers the previous one as the user scrolls.
 *
 * Server component — no JS needed for sticky. Card content reveal is
 * delegated to `<Reveal>`; the cards themselves render through
 * `<ServiceCard>` so the article-level styling and the content
 * structure can evolve independently.
 */
export function Services(): React.ReactElement {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative px-4 pb-32 pt-16 sm:px-8 sm:pb-48 sm:pt-24"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-16 flex items-end justify-between gap-4">
            <h2
              id="services-heading"
              className="text-balance text-[clamp(32px,4.6vw,60px)] font-medium tracking-[-0.03em] text-fg"
            >
              Services
            </h2>
            <span className="hidden text-sm text-muted sm:inline">
              {SERVICES.length.toString().padStart(2, "0")} disciplines
            </span>
          </div>
        </Reveal>

        <div className="relative flex flex-col gap-6">
          {SERVICES.map((service, index) => (
            <article
              key={service.titleLineOne}
              data-testid={`service-card-${index}`}
              className="sticky overflow-hidden rounded-[var(--radius)] bg-card p-8 shadow-2xl md:p-12 lg:p-16"
              style={{
                top: `${TOP_BASE_PX + index * TOP_STEP_PX}px`,
                zIndex: index + 1,
              }}
            >
              <Reveal y={24}>
                <ServiceCard service={service} index={index} />
              </Reveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
