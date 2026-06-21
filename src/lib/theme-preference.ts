/**
 * Encapsulates the read/write/apply triangle for the site's theme so that
 * components and hooks never touch `localStorage` or `document` directly.
 *
 * All methods are SSR-safe: on the server they no-op (read returns the
 * caller's default) so the same module can be imported from server and
 * client components without conditional guards leaking into call sites.
 */

export type Theme = "light" | "dark";

export const THEMES: ReadonlyArray<Theme> = ["light", "dark"];
export const THEME_STORAGE_KEY = "studio-theme";
export const THEME_ATTRIBUTE = "data-theme";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export class ThemePreference {
  /**
   * Resolve the theme to use, in priority order:
   *   1. value previously persisted in localStorage,
   *   2. system `prefers-color-scheme` if available,
   *   3. the caller-supplied default.
   */
  static read(defaultTheme: Theme = "light"): Theme {
    if (typeof window === "undefined") return defaultTheme;

    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (isTheme(stored)) return stored;
    } catch {
      // Private-mode Safari, locked-down browsers, etc.
      // System preference is the next-best signal.
    }

    return ThemePreference.systemPreference() ?? defaultTheme;
  }

  static write(theme: Theme): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage may be disabled; the in-memory state in `useTheme`
      // still keeps the toggle working for the current session.
    }
  }

  static systemPreference(): Theme | null {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return null;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  static apply(theme: Theme): void {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  }

  static toggle(current: Theme): Theme {
    return current === "light" ? "dark" : "light";
  }
}
