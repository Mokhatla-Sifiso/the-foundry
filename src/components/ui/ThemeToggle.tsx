"use client";

import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/lib/theme-preference";

const ICONS: Record<Theme, React.ReactElement> = {
  light: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  dark: (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  ),
};

/**
 * Round icon button that flips between light and dark themes. The icon shown
 * is the *current* theme (sun in light mode, moon in dark mode); the
 * `aria-label` always describes the action the click will take.
 */
export function ThemeToggle(): React.ReactElement {
  const { theme, toggle } = useTheme();
  const next: Theme = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      data-theme-state={theme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg transition-colors hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {ICONS[theme]}
    </button>
  );
}
