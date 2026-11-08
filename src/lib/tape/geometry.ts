/**
 * Caution-tape geometry for the upgrades gate (spec UG 4.2, G5, G12 to G14).
 *
 * Each strip is a flat rectangle placed in one 3D context by the transform chain in tape.css:
 * translateY, rotateZ, rotateY, rotateX, translateZ, under a 1200px perspective. These functions
 * turn the presets into pixels and project each strip's real edges through that same chain, so
 * the layout can guarantee that no strip passes behind the buttons at any size (see fit.ts).
 */

export const PHRASE = "Upgrades in progress";
/** Must match `perspective` and `perspective-origin` in tape.css. */
export const PERSPECTIVE = 1200;
export const PERSPECTIVE_ORIGIN = { x: 0.5, y: 0.46 } as const;

export type TapeLayout = "desktop" | "tablet" | "mobile";
/** The end of a strip that recedes from the viewer and goes out of focus. */
export type FarEnd = "left" | "right";
type Side = -1 | 1;

export interface TapePreset {
  /** Centre line, as a fraction of the scene box height. */
  cy: number;
  /** Rotations, degrees. */
  rz: number;
  ry: number;
  /** Distance toward the viewer, px. */
  tz: number;
  /** Thickness, as a fraction of the scene box height. */
  thick: number;
  far: FarEnd;
  /** Shift of the centred phrase along the strip, in whole repeats. */
  offset: number;
  /** Animation delay, seconds. Negative values start a strip mid-drift, so strips move out of phase. */
  delay: number;
}

/**
 * Three strips crossing the middle of the screen, as in the reference: one high, one on the
 * diagonal, one low (G12). Positions are fractions of the scene box, the band between the top
 * bar and the buttons (G5).
 */
export const PRESETS: Readonly<Record<TapeLayout, readonly TapePreset[]>> = {
  desktop: [
    { cy: 0.27, rz: 5, ry: -16, tz: 40, thick: 0.2, far: "right", offset: -0.04, delay: 0 },
    { cy: 0.52, rz: -11, ry: 15, tz: 110, thick: 0.21, far: "left", offset: 0.05, delay: -7 },
    { cy: 0.78, rz: 2, ry: -12, tz: 70, thick: 0.19, far: "right", offset: 0, delay: -13 },
  ],
  tablet: [
    { cy: 0.27, rz: 5, ry: -16, tz: 40, thick: 0.19, far: "right", offset: -0.04, delay: 0 },
    { cy: 0.52, rz: -12, ry: 15, tz: 100, thick: 0.2, far: "left", offset: 0.05, delay: -7 },
    { cy: 0.78, rz: 2, ry: -12, tz: 60, thick: 0.18, far: "right", offset: 0, delay: -13 },
  ],
  mobile: [
    { cy: 0.2, rz: 6, ry: -14, tz: 30, thick: 0.092, far: "right", offset: -0.06, delay: 0 },
    { cy: 0.5, rz: -14, ry: 13, tz: 70, thick: 0.098, far: "left", offset: 0.04, delay: -7 },
    { cy: 0.8, rz: 3, ry: -11, tz: 50, thick: 0.088, far: "right", offset: 0, delay: -13 },
  ],
};

/** The confirm and unsubscribe pages: one quieter strip low across the screen, from the boards. */
const PAGE_STRIP = { rz: -3, ry: 12, tz: 40, far: "left", offset: 0, delay: 0 } as const;
export const PAGE_PRESETS: Readonly<Record<TapeLayout, readonly TapePreset[]>> = {
  desktop: [{ ...PAGE_STRIP, cy: 0.88, thick: 0.085 }],
  tablet: [{ ...PAGE_STRIP, cy: 0.88, thick: 0.085 }],
  mobile: [{ ...PAGE_STRIP, cy: 0.9, thick: 0.06 }],
};

/**
 * Print size as a share of strip thickness. Smaller on phones so one whole phrase fits across
 * the screen (G14); on wider screens it fills the strip like the reference.
 */
export const PRINT_SCALE: Readonly<Record<TapeLayout, number>> = {
  desktop: 0.62,
  tablet: 0.62,
  mobile: 0.46,
};

/** Each strip tilts against the light by a different amount, and catches it at a different point. */
const TILT = [8, -7, 5] as const;
const BLOOM = [34, 60, 46] as const;

/** Breakpoints for the presets. The gate's CSS stacks the buttons below the same 720px. */
export function layoutFor(width: number): TapeLayout {
  if (width < 720) return "mobile";
  if (width < 1200) return "tablet";
  return "desktop";
}

export interface Stage {
  width: number;
  height: number;
  /** Top of the scene box: the bottom of the top bar. */
  boxTop: number;
  /** Height of the scene box, down to just above the buttons. */
  boxHeight: number;
}

export interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface TapeGeometry {
  rz: number;
  ry: number;
  /** Tilt against the light, degrees. */
  rx: number;
  tz: number;
  far: FarEnd;
  offset: number;
  delay: number;
  /** Thickness, px, scaled back up for the tilt's foreshortening. */
  thick: number;
  /** Length, px: long enough that both ends stay off screen at every angle. */
  len: number;
  /** Centre line, stage px. */
  cy: number;
  /** How far the strip drifts each way along its length, px. */
  drift: number;
  /** Where the light blooms along the strip, percent. */
  bloom: number;
  printScale: number;
}

const rad = (deg: number): number => (deg * Math.PI) / 180;
/** How far a strip of a given thickness drifts each way, px (D7: noticed on a second look). */
export const driftFor = (thick: number): number => Math.round(thick * 0.35);

/** Resolves presets into the geometry each strip renders with, in stage pixels. */
export function resolveTapes(
  stage: Stage,
  presets: readonly TapePreset[],
  printScale: number,
): TapeGeometry[] {
  return presets.map((preset, i) => {
    const rx = TILT[i % TILT.length];
    const thick = (stage.boxHeight * preset.thick * 1.12) / Math.cos(rad(rx));
    return {
      rz: preset.rz,
      ry: preset.ry,
      rx,
      tz: preset.tz,
      far: preset.far,
      offset: preset.offset,
      delay: preset.delay,
      thick,
      len: stage.width * 2.2,
      cy: stage.boxTop + stage.boxHeight * preset.cy,
      drift: driftFor(thick),
      bloom: BLOOM[i % BLOOM.length],
      printScale,
    };
  });
}

/**
 * Screen position of a point on a strip, through the transform chain tape.css applies.
 * `u` runs along the strip from its centre; `v` runs across it, positive toward the bottom edge.
 */
export function projectStripPoint(g: TapeGeometry, stage: Stage, u: number, v: number): Point {
  let x = u;
  let y = v;
  let z = g.tz;
  let c = Math.cos(rad(g.rx));
  let s = Math.sin(rad(g.rx));
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(rad(g.ry));
  s = Math.sin(rad(g.ry));
  [x, z] = [x * c + z * s, -x * s + z * c];
  c = Math.cos(rad(g.rz));
  s = Math.sin(rad(g.rz));
  [x, y] = [x * c - y * s, x * s + y * c];
  const origin = { x: stage.width * PERSPECTIVE_ORIGIN.x, y: stage.height * PERSPECTIVE_ORIGIN.y };
  const k = PERSPECTIVE / (PERSPECTIVE - z);
  return {
    x: origin.x + (stage.width / 2 + x - origin.x) * k,
    y: origin.y + (g.cy + y - origin.y) * k,
  };
}

/** One edge of a strip as a screen polyline, with the strip drifted by `drift` px. */
export function stripEdge(
  g: TapeGeometry,
  stage: Stage,
  side: Side,
  drift: number,
  steps = 48,
): Point[] {
  const points: Point[] = [];
  for (let k = 0; k <= steps; k++) {
    const u = -g.len / 2 + (k / steps) * g.len + drift;
    points.push(projectStripPoint(g, stage, u, (side * g.thick) / 2));
  }
  return points;
}

/**
 * The lowest (`max`) or highest (`min`) y a polyline reaches between two x positions, by linear
 * interpolation along its segments. Null when the polyline never enters the span.
 */
export function edgeExtremeIn(
  edge: readonly Point[],
  left: number,
  right: number,
  pick: "max" | "min",
): number | null {
  const better = pick === "max" ? Math.max : Math.min;
  let best: number | null = null;
  for (let k = 0; k < edge.length - 1; k++) {
    const a = edge[k];
    const b = edge[k + 1];
    if (a.x === b.x) continue;
    const lo = Math.max(Math.min(a.x, b.x), left);
    const hi = Math.min(Math.max(a.x, b.x), right);
    if (lo > hi) continue;
    for (const x of [lo, hi]) {
      const y = a.y + ((x - a.x) / (b.x - a.x)) * (b.y - a.y);
      best = best === null ? y : better(best, y);
    }
  }
  return best;
}
