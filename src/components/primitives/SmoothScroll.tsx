"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth-scroll provider — wraps the page so wheel/touch input
 * eases via an internal RAF loop instead of the browser's native step.
 *
 * Kept as a pure side-effect component (no extra DOM wrapper) so it
 * doesn't disturb sticky positioning, scroll containers, or the
 * existing CSS layout. Renders `children` straight through.
 *
 * Honours `prefers-reduced-motion`: when the user opts out, we never
 * boot Lenis at all, so native scroll behaviour is preserved.
 */
type SmoothScrollProps = Readonly<{ children: React.ReactNode }>;

export function SmoothScroll({ children }: SmoothScrollProps): React.ReactElement {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    let rafId = 0;
    const raf = (time: number): void => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };
    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
