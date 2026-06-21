"use client";

import { useEffect } from "react";

const LOADER_ID = "studio-loader";

const FADE_DURATION_MS = 600;

const MIN_DWELL_MS = 800;

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
