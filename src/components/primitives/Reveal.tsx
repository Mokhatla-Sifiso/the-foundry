"use client";

import type { ElementType, ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

/** The site's only animation easing — VERBATIM `--ease` from §3. */
export const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = Readonly<{
  children: ReactNode;
  /** Initial Y offset in px. Spec default 38. */
  y?: number;
  /** Per-element delay in seconds. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  /** Render as a different tag — e.g. `as="span"` for inline reveals. */
  as?: ElementType;
}>;

/**
 * Scroll-triggered reveal — VERBATIM contract from §6. Wraps the
 * caller in a `motion.<as>` that starts at `opacity:0, y` and settles
 * to `opacity:1, y:0` when the in-view detector reports `seen`.
 *
 * The `useInView` it consumes is the scroll/resize/rect detector
 * (NOT IntersectionObserver) — see `hooks/useInView.ts`.
 */
export function Reveal({
  children,
  y = 38,
  delay = 0,
  className,
  style,
  as = "div",
}: RevealProps): React.ReactElement {
  const [ref, seen] = useInView();
  const Tag = (motion as unknown as Record<string, ElementType>)[as as string] ?? motion.div;
  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={seen ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}
