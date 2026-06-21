"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * In-view detector — VERBATIM from §6 of the build spec. The spec
 * deliberately avoids IntersectionObserver (it failed in some embedded
 * preview contexts in the prototype) and uses scroll/resize + a rect
 * check with a 1500ms fallback so content is guaranteed to reveal
 * even if no scroll event fires.
 *
 * @param margin Fraction of the viewport height the element top must
 *               pass before it's considered "seen" (default 0.16 →
 *               fires when top crosses 84% of viewport height).
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  margin = 0.16,
): readonly [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;

    const check = (): void => {
      if (done) return;
      const r = el.getBoundingClientRect();
      const h = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < h * (1 - margin) && r.bottom > 0) {
        done = true;
        setSeen(true);
        cleanup();
      }
    };

    const cleanup = (): void => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    const onScroll = (): void => check();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    check();

    const t = window.setTimeout(() => {
      if (!done) {
        setSeen(true);
        cleanup();
      }
    }, 1500);

    return () => {
      cleanup();
      window.clearTimeout(t);
    };
  }, [margin]);

  return [ref, seen] as const;
}
