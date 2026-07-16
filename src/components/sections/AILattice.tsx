"use client";
import { useEffect, useRef } from "react";
import { AI_TOOLS } from "@/lib/ai-tools";

const LOGOS = AI_TOOLS.flatMap((g) => g.tools);
const COUNT = 84;
const CELLS: ReadonlyArray<(typeof LOGOS)[number] | null> = (() => {
  const arr: ((typeof LOGOS)[number] | null)[] = Array.from({ length: COUNT }, () => null);
  LOGOS.forEach((logo, j) => {
    let k = (Math.floor((j * COUNT) / LOGOS.length) + (j % 2) * 3) % COUNT;
    while (arr[k]) k = (k + 1) % COUNT;
    arr[k] = logo;
  });
  return arr;
})();

export function AILattice(): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const glow = root.querySelector<HTMLElement>(".lat-glow");
    const tiles = Array.from(root.querySelectorAll<HTMLElement>(".lat-tile"));
    if (!glow || tiles.length === 0) return;
    let raf = 0;
    let timer = 0;
    let last = -1;
    const place = (): void => {
      let i = Math.floor(Math.random() * tiles.length);
      if (i === last && tiles.length > 1) i = (i + 1) % tiles.length;
      last = i;
      const t = tiles[i];
      glow.style.left = `${t.offsetLeft}px`;
      glow.style.top = `${t.offsetTop}px`;
      glow.style.width = `${t.offsetWidth}px`;
      glow.style.height = `${t.offsetHeight}px`;
      glow.classList.remove("run");
      raf = requestAnimationFrame(() => glow.classList.add("run"));
    };
    const onEnd = (): void => {
      timer = window.setTimeout(place, 55);
    };
    glow.addEventListener("animationend", onEnd);
    place();
    return () => {
      glow.removeEventListener("animationend", onEnd);
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);
  return (
    <div className="ai-lattice" ref={ref}>
      <ul className="lat-sr">
        {LOGOS.map((t) => (
          <li key={t.name}>{t.name}</li>
        ))}
      </ul>
      <span className="lat-glow" aria-hidden="true" />
      {CELLS.map((cell, i) => (
        <span className="lat-cell" key={i}>
          <span className="lat-tile">
            {cell ? (
              <span className="lat-in">
                {cell.kind === "icon" ? (
                  <svg viewBox="0 0 24 24">
                    <path d={cell.path} fill="currentColor" />
                  </svg>
                ) : (
                  <span className="lat-mono">{cell.short}</span>
                )}
              </span>
            ) : null}
          </span>
        </span>
      ))}
    </div>
  );
}
