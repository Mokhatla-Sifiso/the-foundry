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

const BOX_GAP = 16;
export const MEASURE_SIZE = 100;

export interface PlacedStrip {
  geometry: TapeGeometry;
  print: PrintRun;
}

export interface TapeScene {
  layout: TapeLayout;
  strips: readonly PlacedStrip[];
  fitted: boolean;
}

export interface TapeSceneRefs {
  stage: RefObject<HTMLElement | null>;
  ceiling: RefObject<HTMLElement | null>;
  avoid: ReadonlyArray<RefObject<HTMLElement | null>>;
  measure: RefObject<HTMLElement | null>;
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
        dropBelowCeiling: layout === "mobile",
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
