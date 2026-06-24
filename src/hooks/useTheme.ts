"use client";
import { useEffect, useState } from "react";
export type Theme = "light" | "dark";
export function useTheme(): {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
} {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const stored = (
      typeof window !== "undefined" ? localStorage.getItem("studio-theme") : null
    ) as Theme | null;
    if (stored && stored !== "light") {
      setTheme(stored);
    }
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("studio-theme", theme);
    } catch {}
  }, [theme]);
  const toggle = (): void => setTheme((p) => (p === "dark" ? "light" : "dark"));
  return { theme, toggle, setTheme };
}
