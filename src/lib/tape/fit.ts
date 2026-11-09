import {
  driftFor,
  edgeExtremeIn,
  projectStripPoint,
  stripEdge,
  type Rect,
  type Stage,
  type TapeGeometry,
} from "./geometry";

/** Clearance kept between the strips and the element they must not pass behind, px. */
export const FIT_MARGIN = 12;
/** Space between repeats of the phrase, in em. Must match the print's `gap` in tape.css. */
export const PRINT_GAP_EM = 0.75;
/** Room kept between a centred word and each side of the screen, px: the gate's phone gutter. */
export const WORD_MARGIN = 16;

/** A stretch of the phrase, in em from its start. */
export interface TextSpan {
  left: number;
  width: number;
}

/** The upper-case phrase measured in the print's real font, in em. */
export interface PrintMetrics {
  phrase: number;
  /** Each word of the phrase, in order. */
  words: readonly TextSpan[];
}

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

/** What a strip centres on screen: its word (G17) or, without one, the whole phrase (G14). */
function focusOf(g: TapeGeometry, metrics: PrintMetrics): TextSpan | null {
  if (g.word === undefined) return { left: 0, width: metrics.phrase };
  return metrics.words[g.word] ?? null;
}

/**
 * Where the print starts so its focus, the strip's word or the whole phrase, sits centred on
 * screen (G14, G17), shifted by the strip's offset, with enough repeats either side to cover the
 * whole strip. A word that was not measured falls back to centring the phrase.
 */
export function printLayout(g: TapeGeometry, metrics: PrintMetrics): PrintRun {
  const size = g.thick * g.printScale;
  const focus = focusOf(g, metrics) ?? { left: 0, width: metrics.phrase };
  const unit = (metrics.phrase + PRINT_GAP_EM) * size;
  // Left edge of the repeat whose focus is centred.
  const centred = g.len / 2 - (focus.left + focus.width / 2) * size + g.offset * unit;
  const before = Math.ceil(centred / unit);
  return {
    start: centred - before * unit,
    repeats: before + Math.ceil((g.len - centred) / unit) + 1,
  };
}

/**
 * Keeps a strip's centred word whole on screen (G17). The print scales with the strip, which
 * scales with the screen's height, so on a phone taller and narrower than the reference frames
 * the word would outgrow the width. This shrinks the print just enough, projecting the word's
 * ends through the strip's transform with the strip at rest, and leaves the strip itself alone.
 * Strips that centre the whole phrase keep their approved print size (G15).
 */
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
