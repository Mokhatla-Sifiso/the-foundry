import {
  driftFor,
  edgeExtremeIn,
  projectStripPoint,
  stripEdge,
  type Rect,
  type Stage,
  type TapeGeometry,
} from "./geometry";

export const FIT_MARGIN = 12;
export const PRINT_GAP_EM = 0.75;
export const WORD_MARGIN = 16;

export interface TextSpan {
  left: number;
  width: number;
}

export interface PrintMetrics {
  phrase: number;
  words: readonly TextSpan[];
}

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

function focusOf(g: TapeGeometry, metrics: PrintMetrics): TextSpan | null {
  if (g.word === undefined) return { left: 0, width: metrics.phrase };
  return metrics.words[g.word] ?? null;
}

export function printLayout(g: TapeGeometry, metrics: PrintMetrics): PrintRun {
  const size = g.thick * g.printScale;
  const focus = focusOf(g, metrics) ?? { left: 0, width: metrics.phrase };
  const unit = (metrics.phrase + PRINT_GAP_EM) * size;
  const centred = g.len / 2 - (focus.left + focus.width / 2) * size + g.offset * unit;
  const before = Math.ceil(centred / unit);
  return {
    start: centred - before * unit,
    repeats: before + Math.ceil((g.len - centred) / unit) + 1,
  };
}

export function fitPrint(
  g: TapeGeometry,
  stage: Stage,
  metrics: PrintMetrics,
  margin = WORD_MARGIN,
): TapeGeometry {
  const word = g.word === undefined ? null : focusOf(g, metrics);
  if (!word) return g;
  const fits = (size: number): boolean => {
    const mid = g.offset * (metrics.phrase + PRINT_GAP_EM) * size;
    const half = (word.width * size) / 2;
    const left = projectStripPoint(g, stage, mid - half, 0).x;
    const right = projectStripPoint(g, stage, mid + half, 0).x;
    return left >= margin && right <= stage.width - margin;
  };
  const size = g.thick * g.printScale;
  if (fits(size)) return g;
  let lo = 0;
  let hi = size;
  for (let step = 0; step < 24; step++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  return { ...g, printScale: lo / g.thick };
}
