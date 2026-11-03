"use client";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { peelForPointer, peelForProgress, type HeroBox } from "@/lib/peel";

type HeroPeelProps = Readonly<{
  /** Hero scroll progress: 0 at rest, 1 once the hero has scrolled out. */
  progress: MotionValue<number>;
  /** What sits under the page: revealed wherever the page is lifted. */
  children: React.ReactNode;
}>;

// The curl lifts in after the loader has cleared.
const ENTRANCE_DELAY_MS = 1200;
// Paper-like settle: quick to follow, slight overshoot on release.
const PEEL_SPRING = { stiffness: 170, damping: 24, mass: 0.9 };

/**
 * The hero's page curl. Scrolling peels the whole page away; the lifted
 * corner can be grabbed and dragged, and springs back to the scroll
 * position on release. Size lives in one motion value, written to the
 * `--peel` CSS variable that globals.css builds the fold from.
 */
export function HeroPeel({ progress, children }: HeroPeelProps): React.ReactElement {
  const reduceMotion = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLDivElement>(null);
  const box = useRef<HeroBox | null>(null);
  const dragging = useRef(false);
  const entered = useRef(false);

  const target = useMotionValue(0);
  const sprung = useSpring(target, PEEL_SPRING);
  const peel = useTransform(reduceMotion ? target : sprung, (size) => `${size}px`);

  const settle = useCallback((): void => {
    if (!box.current || dragging.current || !entered.current) return;
    target.set(peelForProgress(box.current, reduceMotion ? 0 : progress.get()));
  }, [progress, reduceMotion, target]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      box.current = { width: entry.contentRect.width, height: entry.contentRect.height };
      settle();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [settle]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        entered.current = true;
        settle();
      },
      reduceMotion ? 0 : ENTRANCE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [reduceMotion, settle]);

  useMotionValueEvent(progress, "change", settle);

  const follow = (event: React.PointerEvent<HTMLDivElement>): void => {
    const el = containerRef.current;
    if (!dragging.current || !el || !box.current) return;
    const rect = el.getBoundingClientRect();
    target.set(peelForPointer(box.current, event.clientX - rect.left, event.clientY - rect.top));
  };

  const grab = (event: React.PointerEvent<HTMLDivElement>): void => {
    entered.current = true;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    follow(event);
  };

  const release = (event: React.PointerEvent<HTMLDivElement>): void => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    settle();
  };

  const style = { "--peel": peel } as MotionStyle;

  return (
    <motion.div ref={containerRef} className="hero-peel" style={style} aria-hidden="true">
      <div className="peel-under">{children}</div>
      <div className="peel-flap-shadow">
        <div className="peel-flap" />
      </div>
      <div
        className="peel-tip"
        onPointerDown={grab}
        onPointerMove={follow}
        onPointerUp={release}
        onPointerCancel={release}
      />
    </motion.div>
  );
}
