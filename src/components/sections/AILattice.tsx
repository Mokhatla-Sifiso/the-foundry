"use client";
import { useEffect, useRef } from "react";
import { AI_TOOLS } from "@/lib/ai-tools";

const TILES = AI_TOOLS.flatMap((g) => g.tools);

export function AILattice(): React.ReactElement {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const tiles = Array.from(root.querySelectorAll<HTMLElement>(".lat-tile"));
    if (tiles.length === 0) return;
    let timer = 0;
    let last = -1;
    const glow = (): void => {
      let i = Math.floor(Math.random() * tiles.length);
      if (i === last && tiles.length > 1) i = (i + 1) % tiles.length;
      last = i;
      tiles[i].classList.add("on");
    };
    const onEnd = (e: Event): void => {
      const ae = e as AnimationEvent;
      if (ae.animationName !== "lat-lap") return;
      (ae.target as HTMLElement).classList.remove("on");
      timer = window.setTimeout(glow, 60);
    };
    root.addEventListener("animationend", onEnd);
    glow();
    return () => {
      root.removeEventListener("animationend", onEnd);
      window.clearTimeout(timer);
    };
  }, []);
  return (
    <ul className="ai-lattice" ref={ref} aria-label="The tools I work with">
      {TILES.map((t) => (
        <li key={t.name} className="lat-cell">
          <span className="lat-tile">
            <span className="lat-in">
              <span className="lat-mark" aria-hidden="true">
                {t.kind === "icon" ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={t.path} fill="currentColor" />
                  </svg>
                ) : (
                  <span className="lat-mono">{t.short}</span>
                )}
              </span>
              <span className="lat-name">{t.name}</span>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
