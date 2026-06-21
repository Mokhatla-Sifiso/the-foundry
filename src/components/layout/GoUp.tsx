"use client";

import { useCallback } from "react";

type GoUpProps = Readonly<{
  className?: string;
}>;

/**
 * Smooth-scrolls the page back to the top. Lives in `Footer` and is a
 * client component because `window.scrollTo` only exists on the client;
 * keeping it isolated means the rest of the footer can stay server-rendered.
 */
export function GoUp({ className }: GoUpProps): React.ReactElement {
  const handleClick = useCallback((): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll back to top of the page"
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full bg-card-fg/10 px-4 py-2 text-sm font-medium transition hover:bg-card-fg/20"
      }
    >
      <span>Go up</span>
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
