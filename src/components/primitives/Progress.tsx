"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Top-of-viewport scroll progress bar. Spring values are VERBATIM
 * from §7.11 — stiffness 130, damping 28, mass 0.3. The `.progress`
 * class lives in globals.css.
 */
export function Progress(): React.ReactElement {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.3 });

  return <motion.div className="progress" style={{ scaleX: x }} />;
}
