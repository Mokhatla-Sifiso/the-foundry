"use client";
import { Fragment, useRef, type CSSProperties, type RefObject } from "react";
import { useTapeScene, type PlacedStrip } from "@/hooks/useTapeScene";
import { PHRASE, WORDS, type TapeLayout, type TapePreset } from "@/lib/tape/geometry";
import "./tokens.css";
import "./tape.css";

export interface TapeProps {
  /** The element the tape fills. */
  stage: RefObject<HTMLElement | null>;
  /** No strip rises above this element's bottom edge. */
  ceiling: RefObject<HTMLElement | null>;
  /** No strip passes behind these elements. Pass a stable array. */
  avoid: ReadonlyArray<RefObject<HTMLElement | null>>;
  /** The strips to draw, per layout. The gate's three by default. */
  presets?: Readonly<Record<TapeLayout, readonly TapePreset[]>>;
}

/**
 * The glossy caution-tape strips (spec UG 4.2, G12 to G14): the gate's three, or the pages' one.
 * Decorative and hidden from assistive technology: the page's own heading carries the message.
 */
export function Tape({ stage, ceiling, avoid, presets }: TapeProps): React.ReactElement {
  const measure = useRef<HTMLSpanElement>(null);
  const scene = useTapeScene({ stage, ceiling, avoid, measure, presets });
  return (
    <div
      className="ug-tapes"
      aria-hidden="true"
      data-layout={scene?.layout}
      data-fit={scene ? (scene.fitted ? "ok" : "failed") : undefined}
    >
      {/* One element per word, so a phone strip can centre its word (G17). */}
      <span ref={measure} className="ug-tape__measure">
        {WORDS.map((word, i) => (
          <Fragment key={word}>
            {i > 0 && " "}
            <span>{word}</span>
          </Fragment>
        ))}
      </span>
      {scene?.strips.map((strip, i) => (
        <Strip key={i} {...strip} />
      ))}
    </div>
  );
}

/**
 * The computed geometry, handed to tape.css as custom properties. This is the only style the
 * component sets; every visual rule lives in the stylesheet.
 */
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
      {/* Fixed light along the strip; the print slides beneath it. */}
      <div className="ug-tape__light" />
    </div>
  );
}
