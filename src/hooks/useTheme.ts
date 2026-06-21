"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ThemePreference, type Theme } from "@/lib/theme-preference";

/**
 * Window event the toggle dispatches so other `useTheme` consumers on the
 * same page (a header toggle and a footer toggle, for example) re-render
 * in lockstep without a global store.
 */
const THEME_CHANGE_EVENT = "studio:themechange";

type UseThemeReturn = Readonly<{
  theme: Theme;
  setTheme: (next: Theme) => void;
  toggle: () => void;
}>;

/**
 * Subscribes to localStorage state via `useSyncExternalStore` — the React 19
 * idiomatic way to read external state without the `useState` + `useEffect`
 * hydration dance. The DOM `data-theme` attribute is brought into sync on
 * first subscription (one-shot apply) and on every change event.
 */
export function useTheme(defaultTheme: Theme = "light"): UseThemeReturn {
  const subscribe = useCallback(
    (onChange: () => void): (() => void) => {
      if (typeof window === "undefined") return () => {};

      // First subscription on the client — bring the DOM in sync with the
      // value localStorage holds (may differ from what SSR rendered).
      ThemePreference.apply(ThemePreference.read(defaultTheme));

      const handler = (): void => {
        ThemePreference.apply(ThemePreference.read(defaultTheme));
        onChange();
      };

      window.addEventListener("storage", handler);
      window.addEventListener(THEME_CHANGE_EVENT, handler);

      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(THEME_CHANGE_EVENT, handler);
      };
    },
    [defaultTheme],
  );

  const getSnapshot = useCallback(
    (): Theme => ThemePreference.read(defaultTheme),
    [defaultTheme],
  );

  const getServerSnapshot = useCallback((): Theme => defaultTheme, [defaultTheme]);

  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme): void => {
    ThemePreference.write(next);
    ThemePreference.apply(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    }
  }, []);

  const toggle = useCallback((): void => {
    const current = ThemePreference.read(defaultTheme);
    setTheme(ThemePreference.toggle(current));
  }, [defaultTheme, setTheme]);

  return { theme, setTheme, toggle };
}
