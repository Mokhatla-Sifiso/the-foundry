import {
  driftFor,
  edgeExtremeIn,
  stripEdge,
  type Rect,
  type Stage,
  type TapeGeometry,
} from "./geometry";

/** Clearance kept between the strips and the element they must not pass behind, px. */
export const FIT_MARGIN = 12;
/** Space between repeats of the phrase, in em. Must match the print's `gap` in tape.css. */
export const PRINT_GAP_EM = 0.75;

export interface FitOptions {
  /** The element no strip may pass behind (the buttons), in stage px. */
  avoid: Rect;
  /** No strip may rise above this y (the bottom of the top bar). */
  ceiling: number;
  margin?: number;
}

export interface FitResult {
  geoms: TapeGeometry[];
  ok: boolean;
}

/**
 * Enforces the hard constraint on the projected strips, at both ends of their drift: no strip
 * behind the buttons (spec UG 4.1, G13). The group lifts; when lifting would push the top strip
 * past the ceiling, the strips thin a little instead. `ok` is false only if 40 rounds were not
 * enough, which the tests rule out at every reference size.
 */
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
  /** Left edge of the first repeat, px from the strip's start. */
  start: number;
  repeats: number;
}

/**
 * Where the print starts so one whole phrase sits centred on screen (G14), shifted by the
 * strip's offset, with enough repeats either side to cover the whole strip.
 * `phraseWidth` measures the upper-case phrase at a font size, in the real font.
 */
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
