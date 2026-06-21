export type Rgb = Readonly<{ r: number; g: number; b: number }>;

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function hexToRgb(hex: string): Rgb | null {
  const match = HEX_PATTERN.exec(hex.trim());
  if (!match) return null;

  const raw = match[1];
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const intValue = Number.parseInt(full, 16);

  return {
    r: (intValue >> 16) & 0xff,
    g: (intValue >> 8) & 0xff,
    b: intValue & 0xff,
  };
}

export function luminance({ r, g, b }: Rgb): number {
  const channel = (component: number): number => {
    const normalized = component / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(foreground: Rgb, background: Rgb): number {
  const lFg = luminance(foreground);
  const lBg = luminance(background);
  const [lighter, darker] = lFg > lBg ? [lFg, lBg] : [lBg, lFg];
  return (lighter + 0.05) / (darker + 0.05);
}
