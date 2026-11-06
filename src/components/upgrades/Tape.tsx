"use client";
import { useRef, type CSSProperties, type RefObject } from "react";
import { useTapeScene, type PlacedStrip } from "@/hooks/useTapeScene";
import { PHRASE } from "@/lib/tape/geometry";
import "./tokens.css";
import "./tape.css";

export interface TapeProps {
  stage: RefObject<HTMLElement | null>;
  ceiling: RefObject<HTMLElement | null>;
  avoid: ReadonlyArray<RefObject<HTMLElement | null>>;
}

export function Tape({ stage, ceiling, avoid }: TapeProps): React.ReactElement {
  const measure = useRef<HTMLSpanElement>(null);
  const scene = useTapeScene({ stage, ceiling, avoid, measure });
  return (
    <div
      className="ug-tapes"
      aria-hidden="true"
      data-layout={scene?.layout}
      data-fit={scene ? (scene.fitted ? "ok" : "failed") : undefined}
    >
      <span ref={measure} className="ug-tape__measure">
        {PHRASE}
      </span>
      {scene?.strips.map((strip, i) => (
        <Strip key={i} {...strip} />
      ))}
    </div>
  );
}

function stripVars({ geometry: g, print }: PlacedStrip): CSSProperties {
  const vars: Record<`--${string}`, string> = {
    "--len": `${g.len}px`,
    "--thick": `${g.thick}px`,
    "--cy": `${g.cy}px`,
    "--rz": `${g.rz}deg`,
    "--ry": `${g.ry}deg`,
    "--rx": `${g.rx}deg`,
    "--tz": `${g.tz}px`,
    "--drift": `${g.drift}px`,
    "--delay": `${g.delay}s`,
    "--dof": `${(g.thick * 0.045).toFixed(1)}px`,
    "--bloom": `${g.bloom}%`,
    "--phase": `${print.start}px`,
    "--print-scale": String(g.printScale),
  };
  return vars as CSSProperties;
}

function Strip(strip: PlacedStrip): React.ReactElement {
  const run = Array.from({ length: strip.print.repeats }, (_, i) => <span key={i}>{PHRASE}</span>);
  return (
    <div className={`ug-tape ug-tape--far-${strip.geometry.far}`} style={stripVars(strip)}>
      <div className="ug-tape__slide">
        <div className="ug-tape__shadow" />
        <div className="ug-tape__face ug-tape__face--sharp">
          <div className="ug-tape__print">{run}</div>
        </div>
        <div className="ug-tape__face ug-tape__face--soft">
          <div className="ug-tape__print">{run}</div>
        </div>
      </div>
      <div className="ug-tape__light" />
    </div>
  );
}
