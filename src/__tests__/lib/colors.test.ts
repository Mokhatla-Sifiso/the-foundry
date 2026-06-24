import { _hx, _lum, _rgb, _rgba } from "@/lib/colors";
describe("_hx (hex → [r,g,b])", () => {
  it("parses 6-digit hex with leading #", () => {
    expect(_hx("#b2d5e5")).toEqual([0xb2, 0xd5, 0xe5]);
  });
  it("parses 6-digit hex without #", () => {
    expect(_hx("020202")).toEqual([2, 2, 2]);
  });
  it("expands 3-digit shorthand", () => {
    expect(_hx("#abc")).toEqual([0xaa, 0xbb, 0xcc]);
  });
});
describe("_lum (relative luminance)", () => {
  it("is 0 for pure black", () => {
    expect(_lum([0, 0, 0])).toBe(0);
  });
  it("is 1 for pure white", () => {
    expect(_lum([255, 255, 255])).toBe(1);
  });
  it("agrees with the 0.299/0.587/0.114 weights for primaries", () => {
    expect(_lum([255, 0, 0])).toBeCloseTo(0.299, 4);
    expect(_lum([0, 255, 0])).toBeCloseTo(0.587, 4);
    expect(_lum([0, 0, 255])).toBeCloseTo(0.114, 4);
  });
});
describe("_rgb / _rgba (CSS string formatters)", () => {
  it("_rgb wraps the triple", () => {
    expect(_rgb([1, 2, 3])).toBe("rgb(1,2,3)");
  });
  it("_rgba appends opacity", () => {
    expect(_rgba([1, 2, 3], 0.5)).toBe("rgba(1,2,3,0.5)");
  });
});
