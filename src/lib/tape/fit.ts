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
  avoid: Rect;
  ceiling: number;
  margin?: number;
}

export interface FitResult {
  geoms: TapeGeometry[];
  ok: boolean;
}

export function fitTapes(
  geoms: readonly TapeGeometry[],
  stage: Stage,
  { avoid, ceiling, margin = FIT_MARGIN }: FitOptions,
): FitResult {
  let current = geoms.map((g) => ({ ...g }));
  for (let round = 0; round < 40; round++) {
    let lowest = -Infinity;
    let highest = Infinity;
    for (const g of current) {
      for (const drift of [-g.drift, g.drift]) {
        const bottom = edgeExtremeIn(stripEdge(g, stage, 1, drift), avoid.left, avoid.right, "max");
        if (bottom !== null) lowest = Math.max(lowest, bottom);
        const top = edgeExtremeIn(stripEdge(g, stage, -1, drift), 0, stage.width, "min");
        if (top !== null) highest = Math.min(highest, top);
      }
    }
    const lift = lowest - (avoid.top - margin);
    if (lift <= 0) return { geoms: current, ok: true };
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
