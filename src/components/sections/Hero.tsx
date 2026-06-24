"use client";
import { EASE } from "@/components/primitives/Reveal";
import { SITE } from "@/lib/constants";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
export function Hero(): React.ReactElement {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yRender = useTransform(scrollYProgress, [0, 1], [0, -40]);
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

      <div className="hero-render-wrap">
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
            sizes="(min-width: 1280px) 620px, (min-width: 768px) 40vw, 64vw"
            style={{ objectFit: "cover", borderRadius: 26 }}
          />
        </motion.div>
      </div>

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
