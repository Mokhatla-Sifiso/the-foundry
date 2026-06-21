import { contrast, hexToRgb, luminance } from "@/lib/colors";

describe("hexToRgb", () => {
  it("parses 6-digit hex with leading #", () => {
    expect(hexToRgb("#b2d5e5")).toEqual({ r: 0xb2, g: 0xd5, b: 0xe5 });
  });

  it("parses 6-digit hex without #", () => {
    expect(hexToRgb("020202")).toEqual({ r: 2, g: 2, b: 2 });
  });

  it("expands 3-digit shorthand", () => {
    expect(hexToRgb("#abc")).toEqual({ r: 0xaa, g: 0xbb, b: 0xcc });
  });

  it("tolerates surrounding whitespace and mixed case", () => {
    expect(hexToRgb("  #FfAa00 ")).toEqual({ r: 0xff, g: 0xaa, b: 0x00 });
  });

  it("returns null for invalid input", () => {
    expect(hexToRgb("")).toBeNull();
    expect(hexToRgb("#xyz")).toBeNull();
    expect(hexToRgb("#abcd")).toBeNull();
    expect(hexToRgb("rgb(0,0,0)")).toBeNull();
  });
});

describe("luminance", () => {
  it("returns 0 for pure black", () => {
    expect(luminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5);
  });

  it("returns 1 for pure white", () => {
    expect(luminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
  });

  it("returns ~0.2126 for pure red per WCAG", () => {
    expect(luminance({ r: 255, g: 0, b: 0 })).toBeCloseTo(0.2126, 4);
  });
});

describe("contrast", () => {
  it("maxes out at 21:1 for black-on-white", () => {
    const ratio = contrast({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("is symmetric (order of fg/bg doesn't matter)", () => {
    const a = contrast({ r: 0, g: 0, b: 0 }, { r: 178, g: 213, b: 229 });
    const b = contrast({ r: 178, g: 213, b: 229 }, { r: 0, g: 0, b: 0 });
    expect(a).toBeCloseTo(b, 5);
  });

  it("returns 1 for identical colors", () => {
    expect(contrast({ r: 50, g: 50, b: 50 }, { r: 50, g: 50, b: 50 })).toBeCloseTo(1, 5);
  });
});
