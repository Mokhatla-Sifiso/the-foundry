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
    cards.forEach((c) => {
      c.style.transformOrigin = "top center";
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
