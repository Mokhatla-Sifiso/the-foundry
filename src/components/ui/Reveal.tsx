"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type RevealProps = Omit<
  HTMLMotionProps<"div">,
  "initial" | "whileInView" | "viewport" | "transition"
> & {
  /** Initial Y offset in pixels — controls how far the element rises into view. */
  y?: number;
  /** Per-element entrance delay in seconds, useful for staggering siblings. */
  delay?: number;
};

const ENTER_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-triggered reveal wrapper. Mirrors the prototype's behaviour: opacity
 * 0 + small Y offset → settle to opacity 1 + y=0 when the element first
 * enters the viewport with a 12% bottom margin (so it triggers slightly
 * before the element is fully visible).
 */
export function Reveal({
  children,
  y = 40,
  delay = 0,
  ...rest
}: RevealProps): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.8, delay, ease: ENTER_EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
