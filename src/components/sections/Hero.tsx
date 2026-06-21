"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SITE } from "@/lib/constants";
import { parallaxRange } from "@/lib/parallax";
import { HeroPortrait } from "./HeroPortrait";

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

/** Total px the wordmark drifts up across the section's scroll window. */
const WORDMARK_PARALLAX_DISTANCE = 80;
/** Total px the portrait drifts up — larger so it reads as nearer the camera. */
const PORTRAIT_PARALLAX_DISTANCE = 180;

const wordmark: string = SITE.shortName.toUpperCase();

/**
 * First section of the page. Composes the giant wordmark, the
 * overlapping portrait, and a role/tagline meta block — each animated
 * on its own track:
 *
 *   - The wordmark's letters reveal with a small Y rise + opacity fade,
 *     staggered by index for the prototype's cascading entrance.
 *   - The wordmark and portrait translate upward on scroll at different
 *     speeds; the parallax distances come from `parallaxRange` so the
 *     math stays unit-testable.
 *
 * Pulled all numeric constants out of the JSX so the visual is easy to
 * tune from a single block at the top of the file.
 */
export function Hero(): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const wordmarkY = useTransform(
    scrollYProgress,
    [0, 1],
    parallaxRange(WORDMARK_PARALLAX_DISTANCE),
  );
  const portraitY = useTransform(
    scrollYProgress,
    [0, 1],
    parallaxRange(PORTRAIT_PARALLAX_DISTANCE),
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-screen flex-col justify-end overflow-hidden px-4 pb-16 pt-40 sm:px-8 sm:pb-24"
    >
      <motion.h1
        id="hero-heading"
        aria-label={SITE.name}
        style={{ y: wordmarkY }}
        className="select-none text-balance text-[clamp(80px,27vw,460px)] font-extrabold leading-[0.85] tracking-[-0.06em] text-fg"
      >
        <span aria-hidden="true" className="block">
          {wordmark.split("").map((char, index) => (
            <motion.span
              key={`${char}-${index}`}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.85,
                delay: 0.15 + index * 0.05,
                ease: REVEAL_EASE,
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      </motion.h1>

      <motion.div
        aria-hidden="true"
        style={{ y: portraitY }}
        className="pointer-events-none absolute right-[6%] top-[22%] aspect-[3/4] w-[42vw] max-w-[420px] overflow-hidden rounded-[var(--radius)] bg-card shadow-2xl sm:w-[32vw]"
      >
        <HeroPortrait />
      </motion.div>

      <div className="relative z-10 mt-8 flex max-w-xl flex-col gap-1 text-fg-2">
        <p className="text-base font-medium text-fg sm:text-lg">{SITE.role}</p>
        <p className="text-sm sm:text-base">{SITE.tagline}</p>
      </div>
    </section>
  );
}
