export const PHRASE = "Upgrades in progress";
export const WORDS: readonly string[] = PHRASE.split(" ");
export const PERSPECTIVE = 1200;
export const PERSPECTIVE_ORIGIN = { x: 0.5, y: 0.46 } as const;

export type TapeLayout = "desktop" | "tablet" | "mobile";
export type FarEnd = "left" | "right";
type Side = -1 | 1;

export interface TapePreset {
  cy: number;
  rz: number;
  ry: number;
  tz: number;
  thick: number;
  far: FarEnd;
  offset: number;
  delay: number;
  word?: number;
  print?: number;
}

const PHONE = { offset: 0, print: 0.56 } as const;

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
    { ...PHONE, cy: 0.2, rz: 6, ry: -14, tz: 30, thick: 0.17, far: "right", delay: 0, word: 0 },
    { ...PHONE, cy: 0.5, rz: -14, ry: 13, tz: 70, thick: 0.18, far: "left", delay: -7, word: 1 },
    { ...PHONE, cy: 0.8, rz: 3, ry: -11, tz: 50, thick: 0.165, far: "right", delay: -13, word: 2 },
  ],
};

const PAGE_STRIP = { rz: -3, ry: 12, tz: 40, far: "left", offset: 0, delay: 0 } as const;
export const PAGE_PRESETS: Readonly<Record<TapeLayout, readonly TapePreset[]>> = {
  desktop: [{ ...PAGE_STRIP, cy: 0.88, thick: 0.085 }],
  tablet: [{ ...PAGE_STRIP, cy: 0.88, thick: 0.085 }],
  mobile: [{ ...PAGE_STRIP, cy: 0.9, thick: 0.06 }],
};

export const PRINT_SCALE: Readonly<Record<TapeLayout, number>> = {
  desktop: 0.62,
  tablet: 0.62,
  mobile: 0.46,
};

const TILT = [8, -7, 5] as const;
const BLOOM = [34, 60, 46] as const;

export function layoutFor(width: number): TapeLayout {
  if (width < 720) return "mobile";
  if (width < 1200) return "tablet";
  return "desktop";
}

export interface Stage {
  width: number;
  height: number;
  boxTop: number;
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
  rx: number;
  tz: number;
  far: FarEnd;
  offset: number;
  delay: number;
  word?: number;
  thick: number;
  len: number;
  cy: number;
  drift: number;
  bloom: number;
  printScale: number;
}

const rad = (deg: number): number => (deg * Math.PI) / 180;
export const driftFor = (thick: number): number => Math.round(thick * 0.35);

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
      word: preset.word,
      thick,
      len: stage.width * 2.2,
      cy: stage.boxTop + stage.boxHeight * preset.cy,
      drift: driftFor(thick),
      bloom: BLOOM[i % BLOOM.length],
      printScale: preset.print ?? printScale,
    };
  });
}

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
