"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SITE } from "@/lib/constants";

type NavProps = Readonly<{
  /** Called when the user activates the menu trigger. */
  onMenuOpen: () => void;
  /** Whether the menu is currently open — drives `aria-expanded`. */
  menuOpen: boolean;
}>;

/**
 * Sticky glass pill at the top of the viewport. Holds the studio mark,
 * a "Let's talk" mailto, the theme toggle, and the menu trigger.
 * State is owned by `<NavBar>`; this component is presentational.
 */
export function Nav({ onMenuOpen, menuOpen }: NavProps): React.ReactElement {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-full border border-line bg-bg/70 px-4 py-2 shadow-sm backdrop-blur-md sm:px-6 sm:py-3">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-fg sm:text-base"
        >
          {SITE.shortName} Studio
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={`mailto:${SITE.email}`}
            className="hidden items-center rounded-full bg-btn px-4 py-2 text-sm font-medium text-btn-fg transition hover:opacity-90 sm:inline-flex"
          >
            Let&apos;s talk
          </a>
          <ThemeToggle />
          <button
            type="button"
            onClick={onMenuOpen}
            aria-expanded={menuOpen}
            aria-controls="studio-menu"
            aria-label="Open menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg transition hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
