"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
export function useInView<T extends HTMLElement = HTMLElement>(
  margin = 0.16,
): readonly [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const raf = window.requestAnimationFrame(() => setSeen(true));
      return () => window.cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: `0px 0px -${Math.round(margin * 100)}% 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, seen] as const;
}
