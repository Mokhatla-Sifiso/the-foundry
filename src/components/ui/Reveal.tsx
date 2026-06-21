"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type RevealProps = Omit<
  HTMLMotionProps<"div">,
  "initial" | "whileInView" | "viewport" | "transition"
> & {
  y?: number;
  delay?: number;
};

const ENTER_EASE = [0.22, 1, 0.36, 1] as const;

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
