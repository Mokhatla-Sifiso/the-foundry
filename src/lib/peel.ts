export type HeroBox = Readonly<{ width: number; height: number }>;

const PHONE_MAX_WIDTH = 720;
const MIN_PEEL = 80;
const FULL_PEEL_PROGRESS = 0.85;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export function restPeel({ width }: HeroBox): number {
  return width < PHONE_MAX_WIDTH
    ? clamp(width * 0.46, 150, 280)
    : clamp(width * 0.34, 260, 560);
}

export function maxPeel({ width, height }: HeroBox): number {
  return width + height;
}

export function peelForProgress(box: HeroBox, progress: number): number {
  const rest = restPeel(box);
  const t = clamp(progress / FULL_PEEL_PROGRESS, 0, 1);
  return rest + (maxPeel(box) - rest) * t * t;
}

export function peelForPointer(box: HeroBox, x: number, y: number): number {
  const size = (box.width - x + (box.height - y)) / 2;
  return clamp(size, MIN_PEEL, maxPeel(box));
}
