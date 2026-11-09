import {
  driftFor,
  edgeExtremeIn,
  stripEdge,
  type Rect,
  type Stage,
  type TapeGeometry,
} from "./geometry";

export const FIT_MARGIN = 12;
export const PRINT_GAP_EM = 0.75;
export interface FitOptions {
  avoid: readonly Rect[];
  ceiling: number;
  dropBelowCeiling?: boolean;
  margin?: number;
}

export interface FitResult {
  geoms: TapeGeometry[];
  ok: boolean;
}

interface Extremes {
  lift: number;
  highest: number;
}

function extremes(
  geoms: readonly TapeGeometry[],
  stage: Stage,
  avoid: readonly Rect[],
  margin: number,
): Extremes {
  let lift = -Infinity;
  let highest = Infinity;
  for (const g of geoms) {
    for (const drift of [-g.drift, g.drift]) {
      const bottomEdge = stripEdge(g, stage, 1, drift);
      for (const box of avoid) {
        const bottom = edgeExtremeIn(bottomEdge, box.left, box.right, "max");
        if (bottom !== null) lift = Math.max(lift, bottom - (box.top - margin));
      }
      const top = edgeExtremeIn(stripEdge(g, stage, -1, drift), 0, stage.width, "min");
      if (top !== null) highest = Math.min(highest, top);
    }
  }
  return { lift, highest };
}

const lower = (geoms: readonly TapeGeometry[], by: number): TapeGeometry[] =>
  geoms.map((g) => ({ ...g, cy: g.cy + by }));

function dropBelow(
  geoms: TapeGeometry[],
  stage: Stage,
  avoid: readonly Rect[],
  ceiling: number,
  margin: number,
): TapeGeometry[] {
  const at = (by: number): Extremes => extremes(lower(geoms, by), stage, avoid, margin);
  const over = ceiling - at(0).highest;
  if (over <= 0) return geoms;
  let lo = 0;
  let hi = over * 2;
  if (at(hi).highest < ceiling) return geoms;
  for (let step = 0; step < 24; step++) {
    const mid = (lo + hi) / 2;
    if (at(mid).highest < ceiling) lo = mid;
    else hi = mid;
  }
  return at(hi).lift <= 0 ? lower(geoms, hi) : geoms;
}

export function fitTapes(
  geoms: readonly TapeGeometry[],
  stage: Stage,
  { avoid, ceiling, dropBelowCeiling = false, margin = FIT_MARGIN }: FitOptions,
): FitResult {
  let current = geoms.map((g) => ({ ...g }));
  for (let round = 0; round < 40; round++) {
    const { lift, highest } = extremes(current, stage, avoid, margin);
    if (lift <= 0) {
      return {
        geoms: dropBelowCeiling ? dropBelow(current, stage, avoid, ceiling, margin) : current,
        ok: true,
      };
    }
    current =
      highest - ceiling >= lift
        ? current.map((g) => ({ ...g, cy: g.cy - lift }))
        : current.map((g) => ({ ...g, thick: g.thick * 0.96, drift: driftFor(g.thick * 0.96) }));
  }
  return { geoms: current, ok: false };
}

export interface PrintRun {
  start: number;
  repeats: number;
}

export function printLayout(g: TapeGeometry, phraseWidth: (size: number) => number): PrintRun {
  const size = g.thick * g.printScale;
  const phrase = phraseWidth(size);
  const unit = phrase + PRINT_GAP_EM * size;
  const centred = g.len / 2 - phrase / 2 + g.offset * unit;
  const before = Math.ceil(centred / unit);
  return {
    start: centred - before * unit,
    repeats: before + Math.ceil((g.len - centred) / unit) + 1,
  };
}
