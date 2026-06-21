import type { Work } from "@/lib/constants";

type WorkCardProps = Readonly<{ work: Work }>;

/**
 * One project card in the Work grid. When `work.href` is set, the whole
 * card is a link to the project; when it's `null` (NDA, in-progress)
 * the card is a non-interactive article landmark. Either branch shares
 * the same content + hover styling so the grid stays visually uniform.
 *
 * The image slot is a tonal gradient placeholder for now — the design
 * guide's `<image-slot>` becomes a `next/image` later when project
 * cover art is ready (extend `Work` with an optional `image` field).
 */
export function WorkCard({ work }: WorkCardProps): React.ReactElement {
  const baseClassName =
    "group flex flex-col gap-6 rounded-[var(--radius)] bg-card p-6 text-card-fg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl";

  const content = (
    <>
      <div
        aria-hidden="true"
        className="aspect-[4/3] w-full overflow-hidden rounded-[calc(var(--radius)-12px)] bg-gradient-to-br from-candy/40 via-card to-onyx"
      />
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.15em] text-card-muted">
          <span>{work.role}</span>
          <span>{work.year}</span>
        </div>
        <h3 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          {work.title}
        </h3>
        <p className="text-card-muted">{work.blurb}</p>
      </div>
    </>
  );

  if (work.href) {
    return (
      <a
        href={work.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${work.title} — open in new tab`}
        className={baseClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <article aria-label={work.title} className={baseClassName}>
      {content}
    </article>
  );
}
