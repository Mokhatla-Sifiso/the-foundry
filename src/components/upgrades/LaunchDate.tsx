"use client";
import { useEffect, useState, type Ref } from "react";

const GLYPHS = ["X", "K", "Y", "/", "%", "#"] as const;

function nextDelay(): number {
  return Math.random() < 0.3 ? 160 : 1200 + Math.random() * 4000;
}

export interface LaunchDateProps {
  ref?: Ref<HTMLParagraphElement>;
}

export function LaunchDate({ ref }: LaunchDateProps): React.ReactElement {
  const [glyph, setGlyph] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const glitch = (): void => {
      setGlyph(GLYPHS[Math.floor(Math.random() * GLYPHS.length)]);
      timer = window.setTimeout(glitch, nextDelay());
    };
    timer = window.setTimeout(glitch, nextDelay());
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <p ref={ref} className="ug-date">
      <span
        className={glyph ? "ug-date__x is-glitching" : "ug-date__x"}
        data-glyph={glyph ?? "X"}
        onAnimationEnd={() => setGlyph(null)}
      >
        X
      </span>
      .11.26
    </p>
  );
}
