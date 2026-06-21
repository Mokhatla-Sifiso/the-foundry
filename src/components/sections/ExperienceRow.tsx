import type { ExperienceRow as ExperienceRowData } from "@/lib/constants";

type ExperienceRowProps = Readonly<{ row: ExperienceRowData }>;

/**
 * Single timeline row in the Experience section. 3-column grid on
 * desktop (period | company | role + blurb), stacks on mobile.
 * `group` + `group-hover:translate-x-2` produces the subtle indent
 * the design guide calls out under "Row reveal with indent on hover".
 */
export function ExperienceRow({ row }: ExperienceRowProps): React.ReactElement {
  return (
    <div
      role="listitem"
      className="group grid items-baseline gap-x-12 gap-y-3 border-b border-line py-8 transition-transform duration-300 ease-out hover:translate-x-2 md:grid-cols-[180px_180px_1fr] md:py-10"
    >
      <span className="text-sm font-medium uppercase tracking-[0.1em] text-muted">
        {row.period}
      </span>
      <span className="text-base font-semibold text-fg md:text-lg">
        {row.company}
      </span>
      <div className="flex flex-col gap-2">
        <p className="text-base font-medium text-fg md:text-lg">{row.role}</p>
        <p className="text-fg-2">{row.blurb}</p>
      </div>
    </div>
  );
}
