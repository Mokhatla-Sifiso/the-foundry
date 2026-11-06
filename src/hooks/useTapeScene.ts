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
  type TapePreset,
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
  /**
   * No strip passes behind these elements (the buttons, the date). The scene box ends above the
   * highest of them, or at the bottom of the stage when there are none. Pass a stable array: a
   * new one on every render would lay out every render.
   */
  avoid: ReadonlyArray<RefObject<HTMLElement | null>>;
  /** The phrase rendered at MEASURE_SIZE in the print's font. */
  measure: RefObject<HTMLElement | null>;
  /** The strips to lay out, per layout. The gate's three by default. */
  presets?: Readonly<Record<TapeLayout, readonly TapePreset[]>>;
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
export function useTapeScene({
  stage,
  ceiling,
  avoid,
  measure,
  presets = PRESETS,
}: TapeSceneRefs): TapeScene | null {
  const [scene, setScene] = useState<TapeScene | null>(null);

  useEffect(() => {
    const stageEl = stage.current;
    const ceilingEl = ceiling.current;
    const measureEl = measure.current;
    const boxes = avoid.map((ref) => ref.current).filter((el): el is HTMLElement => el !== null);
    if (!stageEl || !ceilingEl || !measureEl) return;
    if (boxes.length !== avoid.length) return;

    let frame = 0;
    let live = true;
    const compute = (): void => {
      const { clientWidth: width, clientHeight: height } = stageEl;
      if (width === 0 || height === 0) return;
      const frameRect = stageEl.getBoundingClientRect();
      const top = relativeRect(ceilingEl, frameRect).bottom;
      const rects = boxes.map((el) => relativeRect(el, frameRect));
      const bottom = rects.length ? Math.min(...rects.map((r) => r.top)) : height + BOX_GAP;
      const layout = layoutFor(width);
      const s: Stage = { width, height, boxTop: top, boxHeight: bottom - BOX_GAP - top };
      if (s.boxHeight <= 0) {
        setScene({ layout, strips: [], fitted: false });
        return;
      }
      const perPx = measureEl.getBoundingClientRect().width / MEASURE_SIZE;
      const phraseWidth = (size: number): number => size * perPx;
      const fit = fitTapes(resolveTapes(s, presets[layout], PRINT_SCALE[layout]), s, {
        avoid: rects,
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
    for (const el of boxes) observer?.observe(el);
    void document.fonts?.ready.then(() => {
      if (live) schedule();
    });
    schedule();
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [stage, ceiling, avoid, measure, presets]);

  return scene;
}
