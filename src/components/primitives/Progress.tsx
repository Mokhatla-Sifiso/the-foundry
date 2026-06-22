"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function Progress(): React.ReactElement {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.3 });

  return <motion.div className="progress" style={{ scaleX: x }} />;
}
