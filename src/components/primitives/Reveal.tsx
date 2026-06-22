"use client";

import type { ElementType, ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

export const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = Readonly<{
  children: ReactNode;
    y?: number;
    delay?: number;
  className?: string;
  style?: CSSProperties;
    as?: ElementType;
}>;

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
