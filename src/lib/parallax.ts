/**
 * Pure helpers for the scroll-driven parallax animations used by sections
 * (Hero, AI). Kept out of the components so the math is unit-testable
 * without spinning up framer-motion / jsdom.
 */

/**
 * A `[from, to]` pair consumable by framer-motion's
 * `useTransform(input, [0, 1], output)`. Mutable (not `readonly`) because
 * `useTransform`'s output-range overload expects a non-readonly array.
 */
export type ParallaxMapping = [number, number];

/**
 * Build a Y translation range for a parallax element.
 *
 * @param distance Total pixels the element should travel across the full
 *                 0..1 scroll progress window.
 * @param direction `-1` (default) moves the element up as the page scrolls
 *                  down; `1` moves it down (rarely useful but supported).
 *
 * Example: `parallaxRange(200)` → `[0, -200]`. Feed straight into
 * `useTransform(scrollYProgress, [0, 1], parallaxRange(200))`.
 */
export function parallaxRange(distance: number, direction: 1 | -1 = -1): ParallaxMapping {
  // `0 * -1` is `-0` in JavaScript; normalise so consumers and tests see a clean `0`.
  const offset = distance * direction || 0;
  return [0, offset];
}
