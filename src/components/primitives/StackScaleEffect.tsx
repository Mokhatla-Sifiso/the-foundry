"use client";
import { useEffect } from "react";
import { lenisBus } from "@/lib/lenis-bus";

const BASE_TOP = 80;
const STEP = 48;
const SCALE_PER_LAYER = 0.05;
const SCALE_RANGE = 320;

export function StackScaleEffect(): null {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".svc-card"));
    const stack = document.querySelector<HTMLElement>(".stack");
    if (!cards.length || !stack) return;

    let naturalY: number[] = [];
    let cardH: number[] = [];
    let thresholds: number[] = [];
    let stackBottom = 0;

    // Read the cards' true (untransformed) document geometry. We clear any
    // applied transform first, because getBoundingClientRect reports the
    // transformed box — measuring with a transform still on would feed a wrong
    // natural position back in. Card heights are viewport-relative (vh / clamp),
    // so this is re-run on resize / orientation change.
    function measure(): void {
      for (const c of cards) c.style.transform = "";
      const sy = window.scrollY;
      naturalY = cards.map((c) => c.getBoundingClientRect().top + sy);
      cardH = cards.map((c) => c.getBoundingClientRect().height);
      thresholds = naturalY.map((y, i) => y - (BASE_TOP + i * STEP));
      stackBottom = stack!.getBoundingClientRect().bottom + sy;
    }

    for (const c of cards) {
      c.style.transformOrigin = "top center";
      c.style.willChange = "transform";
    }

    // Compute the transform from the ACTUAL current scroll position, read live
    // at paint time. A card "sticks" because we translate it down by exactly
    // (scroll - threshold); that offset only stays constant if the scroll value
    // we translate against equals the browser's real paint-time scroll
    // position. Reading window.scrollY here — rather than a scroll value
    // emitted from Lenis or captured off an event — guarantees that on every
    // device. Lenis moves window.scrollY on desktop (smoothWheel), and native
    // touch moves window.scrollY on mobile (Lenis leaves touch alone by
    // default), so the two can never drift and wobble the card.
    function apply(): void {
      const scroll = window.scrollY;
      for (let i = 0; i < cards.length; i++) {
        const rawY = Math.max(0, scroll - thresholds[i]);
        const maxY = stackBottom - naturalY[i] - cardH[i];
        const translateY = Math.min(rawY, maxY);
        let reduction = 0;
        for (let j = i + 1; j < cards.length; j++) {
          const dist = thresholds[j] - scroll;
          if (dist <= 0) {
            reduction += SCALE_PER_LAYER;
          } else if (dist < SCALE_RANGE) {
            reduction += SCALE_PER_LAYER * (1 - dist / SCALE_RANGE);
          }
        }
        cards[i].style.transform =
          `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${(1 - reduction).toFixed(4)})`;
      }
    }

    // One transform write per frame, regardless of how many scroll signals
    // land in that frame. Both Lenis and the native scroll event now converge
    // on the same live source, so there is nothing to reconcile.
    let rafId = 0;
    const schedule = (): void => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        apply();
      });
    };

    measure();
    apply();

    const unsub = lenisBus.on(schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    const onResize = (): void => {
      measure();
      apply();
    };
    window.addEventListener("resize", onResize);

    return (): void => {
      if (rafId) window.cancelAnimationFrame(rafId);
      unsub();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      for (const c of cards) {
        c.style.transform = "";
        c.style.transformOrigin = "";
        c.style.willChange = "";
      }
    };
  }, []);
  return null;
}
