/**
 * Color helpers — VERBATIM from §7.8.1 of the build spec. Used by the
 * AI section's scroll-latched background to interpolate between edge
 * and peak colors at run time.
 */

export const _hx = (h: string): number[] => {
  h = h.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const _lum = (a: number[]): number =>
  (0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2]) / 255;

export const _rgb = (a: number[]): string => `rgb(${a[0]},${a[1]},${a[2]})`;

export const _rgba = (a: number[], o: number): string =>
  `rgba(${a[0]},${a[1]},${a[2]},${o})`;
