/**
 * Pure color-math helpers used by the theme accent picker and any future
 * computed contrast logic. WCAG 2.x formulas — they don't depend on a
 * specific color library, which keeps this module test-friendly.
 */

export type Rgb = Readonly<{ r: number; g: number; b: number }>;

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Parse a CSS hex color (`#abc`, `#aabbcc`, or the same without the leading `#`)
 * into an `Rgb` triple. Returns `null` for any input that isn't a valid 3- or
 * 6-digit hex value so callers can decide how to react rather than getting a
 * silent NaN.
 */
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

/**
 * Relative luminance per WCAG 2.x — the perceived brightness of a color on a
 * 0..1 scale. Used as the input to `contrast`.
 */
export function luminance({ r, g, b }: Rgb): number {
  const channel = (component: number): number => {
    const normalized = component / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * WCAG contrast ratio between two colors. Range is 1..21 — pairs that score
 * 4.5+ pass AA for normal text, 7+ pass AAA.
 */
export function contrast(foreground: Rgb, background: Rgb): number {
  const lFg = luminance(foreground);
  const lBg = luminance(background);
  const [lighter, darker] = lFg > lBg ? [lFg, lBg] : [lBg, lFg];
  return (lighter + 0.05) / (darker + 0.05);
}
