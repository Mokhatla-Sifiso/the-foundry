"use client";
import { useEffect, useState, type Ref } from "react";

/** What the X flickers through while it glitches. */
const GLYPHS = ["X", "K", "Y", "/", "%", "#"] as const;

/** Usually a pause of one to five seconds; now and then a second glitch straight after. */
function nextDelay(): number {
  return Math.random() < 0.3 ? 160 : 1200 + Math.random() * 4000;
}

export interface LaunchDateProps {
  ref?: Ref<HTMLParagraphElement>;
}

/**
 * The launch date, a day in November 2026 still to be set, printed small beside the buttons.
 * At random moments the X glitches for a fifth of a second; with reduced motion it stays still.
 */
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
