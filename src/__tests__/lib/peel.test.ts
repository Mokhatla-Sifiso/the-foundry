import { maxPeel, peelForPointer, peelForProgress, restPeel } from "@/lib/peel";

const desktop = { width: 1440, height: 900 };
const phone = { width: 375, height: 812 };

describe("restPeel", () => {
  it("is about a third of a desktop hero", () => {
    expect(restPeel(desktop)).toBeCloseTo(1440 * 0.34);
  });

  it("clamps on very wide and very narrow desktops", () => {
    expect(restPeel({ width: 3000, height: 900 })).toBe(560);
    expect(restPeel({ width: 740, height: 900 })).toBe(260);
  });

  it("takes a bigger share of the width on phones", () => {
    expect(restPeel(phone)).toBeCloseTo(375 * 0.46);
    expect(restPeel({ width: 280, height: 600 })).toBe(150);
  });
});

describe("maxPeel", () => {
  it("is the size at which the fold clears the far corner", () => {
    expect(maxPeel(desktop)).toBe(1440 + 900);
  });
});

describe("peelForProgress", () => {
  it("rests at the resting curl before any scroll", () => {
    expect(peelForProgress(desktop, 0)).toBe(restPeel(desktop));
  });

  it("peels the whole page off by 85% of the hero's scroll-out, and stays there", () => {
    expect(peelForProgress(desktop, 0.85)).toBe(maxPeel(desktop));
    expect(peelForProgress(desktop, 1)).toBe(maxPeel(desktop));
  });

  it("grows monotonically and eases in", () => {
    const samples = [0, 0.1, 0.3, 0.5, 0.7, 0.85].map((p) => peelForProgress(desktop, p));
    samples.slice(1).forEach((size, i) => expect(size).toBeGreaterThan(samples[i]));
    const halfway = peelForProgress(desktop, 0.425);
    const linearHalfway = (restPeel(desktop) + maxPeel(desktop)) / 2;
    expect(halfway).toBeLessThan(linearHalfway);
  });

  it("ignores negative progress", () => {
    expect(peelForProgress(desktop, -0.4)).toBe(restPeel(desktop));
  });
});

describe("peelForPointer", () => {
  it("puts the lifted corner under the pointer along the 45 degree fold", () => {
    expect(peelForPointer(desktop, 1040, 700)).toBe(300);
  });

  it("never pushes the page flatter than the minimum curl", () => {
    expect(peelForPointer(desktop, 1440, 900)).toBe(80);
    expect(peelForPointer(desktop, 2000, 2000)).toBe(80);
  });

  it("never lifts more than the whole page", () => {
    expect(peelForPointer(desktop, -5000, -5000)).toBe(maxPeel(desktop));
  });
});
