"use client";
import { useEffect } from "react";

const BASE_TOP = 80;
const STEP = 48;
const SCALE_PER_LAYER = 0.05;
const SCALE_RANGE = 320;

/**
 * Depth cue for the sticky service-card stack: each card shrinks slightly as
 * the cards after it dock on top of it.
 *
 * Positioning is handled entirely by CSS `position: sticky` (see .svc-card).
 * This effect only ever writes `scale()`. Because scale is anchored at
 * `transform-origin: top center`, it keeps the pinned top edge fixed — so even
 * if the scale value is a frame behind the scroll, a card can never move or
 * jitter. Position and scale are fully decoupled.
 */
export function StackScaleEffect(): null {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".svc-card"));
    if (cards.length < 2) return;

    // Document-absolute layout top of a card. offsetTop reflects normal-flow
    // layout and is unaffected by `position: sticky` pinning, so the dock
    // points stay correct even if a card is pinned when we measure.
    const absTop = (el: HTMLElement): number => {
      let t = 0;
      let n: HTMLElement | null = el;
      while (n) {
        t += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return t;
    };

    // dock[i] = the scroll position at which card i reaches its sticky top.
    let dock: number[] = [];
    const measure = (): void => {
      dock = cards.map((c, i) => absTop(c) - (BASE_TOP + i * STEP));
    };

    const apply = (): void => {
      const y = window.scrollY;
      for (let i = 0; i < cards.length; i++) {
        let reduction = 0;
        for (let j = i + 1; j < cards.length; j++) {
          const remaining = dock[j] - y; // scroll left until card j docks over i
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
