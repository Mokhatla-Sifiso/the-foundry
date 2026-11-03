/**
 * Geometry for the hero's page curl.
 *
 * The curl is a 45 degree fold measured by one number, the peel size S: the
 * fold line runs from (W - S, H) to (W, H - S), so everything with
 * x + y > W + H - S is lifted off the page. S = W + H lifts the whole page.
 */

export type HeroBox = Readonly<{ width: number; height: number }>;

const PHONE_MAX_WIDTH = 720;
// Smallest curl a drag can push the page back down to.
const MIN_PEEL = 80;
// Share of the hero's scroll-out at which the page is fully peeled off.
const FULL_PEEL_PROGRESS = 0.85;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Resting curl size: roughly a third of the hero, larger share on phones. */
export function restPeel({ width }: HeroBox): number {
  return width < PHONE_MAX_WIDTH
    ? clamp(width * 0.46, 150, 280)
    : clamp(width * 0.34, 260, 560);
}

/** The size at which the fold has crossed the far corner: nothing left on the page. */
export function maxPeel({ width, height }: HeroBox): number {
  return width + height;
}

/**
 * Curl size for a scroll position. Eased in so the first part of the scroll
 * lifts gently, then the page comes away completely before the hero leaves.
 */
export function peelForProgress(box: HeroBox, progress: number): number {
  const rest = restPeel(box);
  const t = clamp(progress / FULL_PEEL_PROGRESS, 0, 1);
  return rest + (maxPeel(box) - rest) * t * t;
}

/**
 * Curl size that puts the lifted corner under the pointer. The corner (W, H)
 * folds to (W - S, H - S), so S is the pointer's mean distance from the
 * bottom-right corner along the 45 degree fold axis.
 */
export function peelForPointer(box: HeroBox, x: number, y: number): number {
  const size = (box.width - x + (box.height - y)) / 2;
  return clamp(size, MIN_PEEL, maxPeel(box));
}
