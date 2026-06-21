/**
 * Placeholder shell for the home page.
 *
 * Real sections (Hero, Statement, Services, Work, Experience, AISection, Contact)
 * land in subsequent PRs per the rebuild plan. This component exists so that PR #1
 * proves the design-token plumbing end-to-end without leaving dead markup behind.
 */
export function HomeShell(): React.ReactElement {
  return (
    <section
      aria-label="Site under construction"
      className="flex flex-1 items-center justify-center px-8 pb-16 pt-40 text-center sm:pt-48"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
          The Foundry
        </span>
        <h1 className="text-balance text-5xl font-extrabold tracking-tight md:text-7xl">
          Mzwakhe Mokhatla
        </h1>
        <p className="max-w-md text-base text-fg-2">
          Studio rebuild in progress. Sections are landing branch-by-branch.
        </p>
      </div>
    </section>
  );
}
