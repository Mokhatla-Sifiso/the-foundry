"use client";
import { useCallback, useEffect, useSyncExternalStore } from "react";
export type Theme = "light" | "dark";
const KEY = "studio-theme";
function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}
function readStored(): Theme {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}
function apply(next: Theme): void {
  try {
    localStorage.setItem(KEY, next);
  } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", next);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  }
}
export function useTheme(): {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
} {
  const theme = useSyncExternalStore(subscribe, readStored, (): Theme => "light");
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);
  const setTheme = useCallback((next: Theme): void => apply(next), []);
  const toggle = useCallback((): void => {
    apply(readStored() === "dark" ? "light" : "dark");
  }, []);
  return { theme, toggle, setTheme };
}
