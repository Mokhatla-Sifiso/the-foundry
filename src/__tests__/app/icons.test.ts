import { readFileSync } from "node:fs";
import { join } from "node:path";

const PUBLIC = join(process.cwd(), "public");

describe("site icons", () => {
  it("draws the mark as shapes, so it never depends on a font", () => {
    const svg = readFileSync(join(PUBLIC, "icon.svg"), "utf8");
    expect(svg).not.toMatch(/<text|font-family/);
    expect(svg).toContain('fill="#06090b"');
    expect(svg).toContain('fill="#b2d5e5"');
  });

  it("ships a 180 px Apple icon and a favicon.ico with 16, 32 and 48 px images", () => {
    const png = readFileSync(join(PUBLIC, "apple-touch-icon.png"));
    expect(png.readUInt32BE(16)).toBe(180);
    expect(png.readUInt32BE(20)).toBe(180);
    const ico = readFileSync(join(PUBLIC, "favicon.ico"));
    const count = ico.readUInt16LE(4);
    const sizes = Array.from({ length: count }, (_, i) => ico[6 + i * 16] || 256).sort(
      (a, b) => a - b,
    );
    expect(sizes).toEqual([16, 32, 48]);
  });
});
