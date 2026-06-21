import { Reveal } from "@/components/ui/Reveal";
import { STATEMENT } from "@/lib/constants";

/**
 * Full-width large text under Hero. Pure server component — the reveal
 * animation is delegated to the `<Reveal>` primitive so this file stays
 * focused on copy and layout.
 *
 * Heading level is h2 (Hero owns the page's only h1), and the eyebrow
 * is a sibling span so screen readers don't read it as part of the
 * heading text.
 */
export function Statement(): React.ReactElement {
  return (
    <section
      id="statement"
      aria-labelledby="statement-heading"
      className="relative px-4 py-32 sm:px-8 sm:py-48"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Reveal>
          <span className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
            {STATEMENT.eyebrow}
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2
            id="statement-heading"
            className="text-balance text-[clamp(32px,4.6vw,60px)] font-medium leading-[1.1] tracking-[-0.03em] text-fg"
          >
            {STATEMENT.body}
          </h2>
        </Reveal>
      </div>
    </section>
  );
}
