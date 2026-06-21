import { parallaxRange } from "@/lib/parallax";

describe("parallaxRange", () => {
  it("defaults to translating upward (negative direction)", () => {
    expect(parallaxRange(200)).toEqual([0, -200]);
  });

  it("supports an explicit downward direction", () => {
    expect(parallaxRange(200, 1)).toEqual([0, 200]);
  });

  it("returns a zero-zero range when distance is zero", () => {
    expect(parallaxRange(0)).toEqual([0, 0]);
  });

  it("handles negative distances by inverting the result", () => {
    expect(parallaxRange(-50)).toEqual([0, 50]);
  });
});
