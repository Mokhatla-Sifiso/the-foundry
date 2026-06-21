"use client";

import { useEffect } from "react";

/** Element id of the loader overlay — kept in lockstep with `Loader.tsx`. */
const LOADER_ID = "studio-loader";

/** Total fade-out time (in ms) — match `--loader-fade` in globals.css. */
const FADE_DURATION_MS = 600;

/** Minimum dwell time before fading so the loader doesn't blip on fast paints. */
const MIN_DWELL_MS = 800;

/**
 * Mounted alongside `<Loader />`. Renders nothing; on mount it adds the
 * `.hide` class and removes the element after the CSS transition completes.
 * Splitting the DOM-mutation logic into its own client component keeps
 * `Loader` itself a pure server component.
 */
export function LoaderDismiss(): null {
  useEffect(() => {
    const element = document.getElementById(LOADER_ID);
    if (!element) return;

    const fade = window.setTimeout(() => {
      element.classList.add("hide");
    }, MIN_DWELL_MS);

    const remove = window.setTimeout(() => {
      element.remove();
    }, MIN_DWELL_MS + FADE_DURATION_MS);

    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(remove);
    };
  }, []);

  return null;
}
