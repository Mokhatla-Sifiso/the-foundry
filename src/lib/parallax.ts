export type ParallaxMapping = [number, number];

export function parallaxRange(distance: number, direction: 1 | -1 = -1): ParallaxMapping {
  const offset = distance * direction || 0;
  return [0, offset];
}
