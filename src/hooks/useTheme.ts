"use client";

import { useEffect, useState } from "react";

/**
 * Theme hook — VERBATIM from §5.1 of the build spec. The simple
 * useState + useEffect pattern is intentional: the no-flash inline
 * script in <head> applies `data-theme` before paint, so this hook
 * only needs to keep React state in sync with localStorage and DOM
 * after hydration.
 *
 * Key: `studio-theme`. Default: `"light"`.
 */
export type Theme = "light" | "dark";

export function useTheme(): { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void } {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Hydration-sync with localStorage. The ThemeScript in <head> already
    // applied the correct `data-theme` before paint, so the brief mismatch
    // between SSR ("light") and resolved value is invisible to the user.
    // The new `react-hooks/set-state-in-effect` rule flags this pattern,
    // but the spec (§5.1) explicitly mandates it for `studio-theme` sync.
    const stored = (typeof window !== "undefined" ? localStorage.getItem("studio-theme") : null) as Theme | null;
    if (stored && stored !== "light") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("studio-theme", theme);
    } catch {
      // private-mode Safari etc — silent.
    }
  }, [theme]);

  const toggle = (): void => setTheme((p) => (p === "dark" ? "light" : "dark"));

  return { theme, toggle, setTheme };
}
