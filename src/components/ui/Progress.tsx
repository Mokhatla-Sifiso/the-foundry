"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Fixed-position scroll-progress bar across the top of the viewport. Driven
 * by `useScroll`'s page-level `scrollYProgress` and smoothed through a
 * spring so the fill doesn't jitter on touch scroll.
 */
export function Progress(): React.ReactElement {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      data-testid="scroll-progress"
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent"
      style={{ scaleX }}
    />
  );
}
