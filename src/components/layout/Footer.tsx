import { SITE } from "@/lib/constants";
import { GoUp } from "./GoUp";

/**
 * Big-name dark card pinned to the bottom of the page. Email and location
 * sit on the meta row alongside the GoUp button; the wordmark fills the
 * card with a viewport-relative size so it reads as the page's full stop.
 */
export function Footer(): React.ReactElement {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mx-4 mb-4 mt-16 overflow-hidden rounded-[var(--radius)] bg-card px-6 py-12 text-card-fg sm:mx-6 sm:px-10 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-fg/10 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`mailto:${SITE.email}`}
              className="rounded-full bg-card-fg/10 px-4 py-2 text-sm font-medium transition hover:bg-card-fg/20"
            >
              {SITE.email}
            </a>
            <span
              aria-label="Location"
              className="rounded-full bg-card-fg/5 px-4 py-2 text-sm text-card-muted"
            >
              {SITE.location}
            </span>
          </div>
          <GoUp />
        </div>

        <h2 className="text-balance text-6xl font-extrabold leading-[0.95] tracking-tight sm:text-[clamp(64px,12vw,200px)]">
          {SITE.name}
        </h2>

        <p className="text-sm text-card-muted">
          © {currentYear} {SITE.name}. Crafted in {SITE.location}.
        </p>
      </div>
    </footer>
  );
}
