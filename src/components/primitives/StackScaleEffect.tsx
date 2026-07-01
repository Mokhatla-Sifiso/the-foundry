"use client";
import { useEffect } from "react";

const BASE_TOP = 80;
const STEP = 48;
const SCALE_PER_LAYER = 0.05;
const SCALE_RANGE = 320;

export function StackScaleEffect(): null {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".svc-card"));
    if (cards.length < 2) return;

    const absTop = (el: HTMLElement): number => {
      let t = 0;
      let n: HTMLElement | null = el;
      while (n) {
        t += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return t;
    };

    let dock: number[] = [];
    const measure = (): void => {
      dock = cards.map((c, i) => absTop(c) - (BASE_TOP + i * STEP));
    };

    const apply = (): void => {
      const y = window.scrollY;
      for (let i = 0; i < cards.length; i++) {
        let reduction = 0;
        for (let j = i + 1; j < cards.length; j++) {
          const remaining = dock[j] - y;
          if (remaining <= 0) reduction += SCALE_PER_LAYER;
          else if (remaining < SCALE_RANGE)
            reduction += SCALE_PER_LAYER * (1 - remaining / SCALE_RANGE);
        }
        cards[i].style.transform = reduction > 0 ? `scale(${(1 - reduction).toFixed(4)})` : "";
      }
    };

    let rafId = 0;
    const onScroll = (): void => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        apply();
      });
    };

    measure();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = (): void => {
      measure();
      apply();
    };
    window.addEventListener("resize", onResize);

    return (): void => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      for (const c of cards) c.style.transform = "";
    };
  }, []);
  return null;
}
