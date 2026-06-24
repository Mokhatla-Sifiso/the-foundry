"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { lenisBus } from "@/lib/lenis-bus";
type SmoothScrollProps = Readonly<{
  children: React.ReactNode;
}>;
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
      lenisBus.emit(
        (
          lenis as unknown as {
            scroll: number;
          }
        ).scroll ?? window.scrollY,
      );
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
