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
  /** What no strip may pass behind (the buttons, the date), in stage px. */
  avoid: readonly Rect[];
  /** No strip may rise above this y (the bottom of the top bar). */
  ceiling: number;
  /**
   * Also drop a group that starts above the ceiling back under it, when the buttons leave room.
   * Phones only, whose strips are a large share of a short scene. Without it the ceiling
   * only limits lifting, which keeps desktop and tablet as approved.
   */
  dropBelowCeiling?: boolean;
  margin?: number;
}

export interface FitResult {
  geoms: TapeGeometry[];
  ok: boolean;
}

interface Extremes {
  /** How far the group must rise to clear every element it avoids; zero or less when clear. */
  lift: number;
  /** The highest any strip reaches across the screen. */
  highest: number;
}

/** Where the projected strips reach, at both ends of their drift. */
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

/**
 * Drops a fitted group that starts above the ceiling just far enough to clear it, if it then
 * stays clear of everything it avoids; otherwise leaves it where it is. Strips that recede move
 * a little less than their centre line, so the drop is found by search, not by subtraction.
 */
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
  // No strip recedes far enough to move at half the rate of its centre line.
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

/**
 * Enforces the hard constraint on the projected strips, at both ends of their drift: no strip
 * behind the buttons or the date (spec UG 4.1, G13). The group lifts; when lifting would push
 * the top strip past the ceiling, the strips thin a little instead. With `dropBelowCeiling`, a
 * fitted group that starts above the ceiling then drops under it, if that keeps it clear of the
 * buttons; it is never thinned for the ceiling, since a scene too short for the strips' tilt
 * would thin them to slivers. `ok` is false only if 40 rounds were not enough, which the tests
 * rule out at every reference size.
 */
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
