"use client";
import { useEffect, useState, type RefObject } from "react";
import { fitTapes, printLayout, type PrintRun } from "@/lib/tape/fit";
import {
  PRESETS,
  PRINT_SCALE,
  layoutFor,
  resolveTapes,
  type Rect,
  type Stage,
  type TapeGeometry,
  type TapeLayout,
} from "@/lib/tape/geometry";

/** Space between the bottom of the scene box and the top of the buttons, px (G5). */
const BOX_GAP = 16;
/** Font size the measuring element renders the phrase at. Must match tape.css. */
export const MEASURE_SIZE = 100;

export interface PlacedStrip {
  geometry: TapeGeometry;
  print: PrintRun;
}

export interface TapeScene {
  layout: TapeLayout;
  strips: readonly PlacedStrip[];
  /** False if the strips could not be fitted clear of the buttons. */
  fitted: boolean;
}

export interface TapeSceneRefs {
  /** The element the tape fills. */
  stage: RefObject<HTMLElement | null>;
  /** No strip rises above this element's bottom edge (the top bar). */
  ceiling: RefObject<HTMLElement | null>;
  /** No strip passes behind this element (the buttons). */
  avoid: RefObject<HTMLElement | null>;
  /** The phrase rendered at MEASURE_SIZE in the print's font. */
  measure: RefObject<HTMLElement | null>;
}

function relativeRect(el: HTMLElement, frame: DOMRect): Rect {
  const r = el.getBoundingClientRect();
  return {
    left: r.left - frame.left,
    right: r.right - frame.left,
    top: r.top - frame.top,
    bottom: r.bottom - frame.top,
  };
}

/**
 * Lays the tape out for the stage as it is now, and again whenever the stage or the buttons
 * change size (a resize, the consent banner opening, labels wrapping) and once the web font has
 * loaded, since the print is measured in it. Null until the first layout.
 */
export function useTapeScene({ stage, ceiling, avoid, measure }: TapeSceneRefs): TapeScene | null {
  const [scene, setScene] = useState<TapeScene | null>(null);

  useEffect(() => {
    const stageEl = stage.current;
    const ceilingEl = ceiling.current;
    const avoidEl = avoid.current;
    const measureEl = measure.current;
    if (!stageEl || !ceilingEl || !avoidEl || !measureEl) return;

    let frame = 0;
    let live = true;
    const compute = (): void => {
      const { clientWidth: width, clientHeight: height } = stageEl;
      if (width === 0 || height === 0) return;
      const frameRect = stageEl.getBoundingClientRect();
      const top = relativeRect(ceilingEl, frameRect).bottom;
      const box = relativeRect(avoidEl, frameRect);
      const layout = layoutFor(width);
      const s: Stage = { width, height, boxTop: top, boxHeight: box.top - BOX_GAP - top };
      if (s.boxHeight <= 0) {
        setScene({ layout, strips: [], fitted: false });
        return;
      }
      const perPx = measureEl.getBoundingClientRect().width / MEASURE_SIZE;
      const phraseWidth = (size: number): number => size * perPx;
      const fit = fitTapes(resolveTapes(s, PRESETS[layout], PRINT_SCALE[layout]), s, {
        avoid: box,
        ceiling: top,
      });
      setScene({
        layout,
        fitted: fit.ok,
        strips: fit.geoms.map((geometry) => ({
          geometry,
          print: printLayout(geometry, phraseWidth),
        })),
      });
    };
    const schedule = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(compute);
    };

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    observer?.observe(stageEl);
    observer?.observe(avoidEl);
    void document.fonts?.ready.then(() => {
      if (live) schedule();
    });
    schedule();
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [stage, ceiling, avoid, measure]);

  return scene;
}
