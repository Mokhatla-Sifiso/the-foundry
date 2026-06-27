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

    // Measure once at mount and stamp transform-origin once. Re-stamping
    // transform-origin every frame triggers a style recalc that contributes
    // to the visible jitter; the value never changes anyway.
    const naturalY = cards.map((c) => c.getBoundingClientRect().top + window.scrollY);
    const cardH = cards.map((c) => c.getBoundingClientRect().height);
    const thresholds = naturalY.map((y, i) => y - (BASE_TOP + i * STEP));
    const stackBottom = stack.getBoundingClientRect().bottom + window.scrollY;
    cards.forEach((c) => {
      c.style.transformOrigin = "top center";
      // Promote each card to its own compositing layer immediately so the
      // first transform doesn't trigger a layer-creation hiccup.
      c.style.willChange = "transform";
    });

    function apply(scroll: number): void {
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

    // The real source of jitter was that Lenis (via lenisBus) and the
    // native scroll event were both feeding apply() with slightly
    // different values in the same frame. window.scrollY is the browser's
    // integer-rounded current scroll position; Lenis emits its own
    // floating-point smoothed value, and the two diverge mid-animation.
    //
    // Solution: trust Lenis whenever it's emitting. Only fall back to the
    // native scroll listener when Lenis isn't driving (reduced-motion users
    // who never instantiate it). A short timestamp window keeps the fallback
    // quiet when Lenis briefly idles between scroll bursts.
    let rafId = 0;
    let pending = window.scrollY;
    let lastLenisEmit = 0;

    const schedule = (scroll: number): void => {
      pending = scroll;
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        apply(pending);
      });
    };

    const onLenis = (scroll: number): void => {
      lastLenisEmit = performance.now();
      schedule(scroll);
    };
    const onNativeScroll = (): void => {
      // If Lenis emitted within the last second, it owns the scroll value.
      // Letting native sneak in would race a near-but-not-equal integer value
      // into pending and produce the visible vibration.
      if (performance.now() - lastLenisEmit < 1000) return;
      schedule(window.scrollY);
    };

    apply(window.scrollY);
    const unsub = lenisBus.on(onLenis);
    window.addEventListener("scroll", onNativeScroll, { passive: true });

    return (): void => {
      if (rafId) window.cancelAnimationFrame(rafId);
      unsub();
      window.removeEventListener("scroll", onNativeScroll);
      cards.forEach((c) => {
        c.style.transform = "";
        c.style.transformOrigin = "";
        c.style.willChange = "";
      });
    };
  }, []);
  return null;
}
