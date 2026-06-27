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
    const naturalY = cards.map((c) => c.getBoundingClientRect().top + window.scrollY);
    const cardH = cards.map((c) => c.getBoundingClientRect().height);
    const thresholds = naturalY.map((y, i) => y - (BASE_TOP + i * STEP));
    const stackBottom = stack.getBoundingClientRect().bottom + window.scrollY;
    function apply(scroll: number): void {
      cards.forEach((card, i) => {
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
        card.style.transformOrigin = "top center";
        card.style.transform = `translateY(${translateY.toFixed(2)}px) scale(${(1 - reduction).toFixed(4)})`;
      });
    }
    // Coalesce scroll updates from both sources (Lenis RAF + native scroll
    // event) into a single rAF tick. Without this the two listeners fire in
    // the same frame with values a fraction of a pixel apart, the transforms
    // get rewritten twice, and the cards visibly vibrate on scroll.
    let rafId = 0;
    let pending = window.scrollY;
    const schedule = (scroll: number): void => {
      pending = scroll;
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        apply(pending);
      });
    };

    apply(window.scrollY);
    const unsub = lenisBus.on(schedule);
    const onNativeScroll = (): void => schedule(window.scrollY);
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    return (): void => {
      if (rafId) window.cancelAnimationFrame(rafId);
      unsub();
      window.removeEventListener("scroll", onNativeScroll);
      cards.forEach((c) => {
        c.style.transform = "";
        c.style.transformOrigin = "";
      });
    };
  }, []);
  return null;
}
