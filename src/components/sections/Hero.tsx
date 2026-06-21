"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE } from "@/components/primitives/Reveal";
import { SITE } from "@/lib/constants";

/**
 * Hero — VERBATIM markup, copy, animations from §7.3.
 *
 * Three parallax tracks driven by `useScroll` on the hero ref with
 * offset `['start start', 'end start']`:
 *   - `.hero-render` (portrait): y maps 0..1 → 0..-120 (drifts up).
 *   - `.hero-mark` (background wordmark): y maps 0..1 → 0..80.
 *   - `.scroll-cue` opacity: 1..0 over progress 0..0.7.
 *
 * Entrance animations match the §15 master reference exactly.
 */
export function Hero(): React.ReactElement {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yRender = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yMark = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const cueFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section id="top" className="hero" ref={ref}>
      <motion.div
        className="hero-mark"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
        style={{ y: yMark }}
      >
        mzwakhe
      </motion.div>

      <motion.div
        className="hero-render"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 0.25 }}
        style={{ y: yRender }}
      >
        <div className="glowpad" />
        <Image
          src={SITE.portrait}
          alt={`Portrait of ${SITE.name}`}
          fill
          priority
          sizes="(min-width: 1280px) 520px, (min-width: 768px) 34vw, 64vw"
          style={{ objectFit: "cover", borderRadius: 26 }}
        />
      </motion.div>

      <div className="wrap hero-foot">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
        >
          Turning ideas into <span className="em">digital realities.</span>
        </motion.h1>

        <motion.div
          className="scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ opacity: cueFade }}
        >
          <motion.span
            className="dot"
            animate={{ scale: [1, 0.5, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
