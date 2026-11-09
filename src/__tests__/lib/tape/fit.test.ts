import { FIT_MARGIN, PRINT_GAP_EM, fitTapes, printLayout } from "@/lib/tape/fit";
import {
  PRESETS,
  PRINT_SCALE,
  edgeExtremeIn,
  layoutFor,
  resolveTapes,
  stripEdge,
  type Rect,
  type Stage,
  type TapeGeometry,
} from "@/lib/tape/geometry";

function scene(
  width: number,
  height: number,
  actions: { width: number; height: number },
): { stage: Stage; avoid: Rect } {
  const barBottom = 64;
  const avoid = {
    left: (width - actions.width) / 2,
    right: (width + actions.width) / 2,
    bottom: height - 40,
    top: height - 40 - actions.height,
  };
  return {
    stage: { width, height, boxTop: barBottom, boxHeight: avoid.top - 16 - barBottom },
    avoid,
  };
}

function extent(
  geoms: TapeGeometry[],
  stage: Stage,
  avoid: Rect,
): { lowest: number; highest: number } {
  let lowest = -Infinity;
  let highest = Infinity;
  for (const g of geoms) {
    for (const drift of [-g.drift, g.drift]) {
      const bottom = edgeExtremeIn(
        stripEdge(g, stage, 1, drift, 200),
        avoid.left,
        avoid.right,
        "max",
      );
      if (bottom !== null) lowest = Math.max(lowest, bottom);
      const top = edgeExtremeIn(stripEdge(g, stage, -1, drift, 200), 0, stage.width, "min");
      if (top !== null) highest = Math.min(highest, top);
    }
  }
  return { lowest, highest };
}

describe("fitTapes", () => {
  const cases: Array<[string, number, number, { width: number; height: number }]> = [
    ["desktop", 1440, 900, { width: 660, height: 56 }],
    ["desktop, banner open", 1440, 650, { width: 660, height: 56 }],
    ["tablet", 1024, 768, { width: 660, height: 56 }],
    ["tablet, banner open", 1024, 520, { width: 660, height: 56 }],
    ["mobile", 390, 844, { width: 358, height: 124 }],
    ["mobile, banner open", 390, 424, { width: 358, height: 124 }],
    ["smallest phone", 320, 568, { width: 288, height: 152 }],
  ];

  it.each(cases)(
    "keeps every strip clear of the buttons and under the bar: %s",
    (_l, w, h, actions) => {
      const { stage, avoid } = scene(w, h, actions);
      const layout = layoutFor(w);
      const fit = fitTapes(resolveTapes(stage, PRESETS[layout], PRINT_SCALE[layout]), stage, {
        avoid: [avoid],
        ceiling: stage.boxTop,
        dropBelowCeiling: layout === "mobile",
      });
      expect(fit.ok).toBe(true);
      const { lowest, highest } = extent(fit.geoms, stage, avoid);
      expect(lowest).toBeLessThanOrEqual(avoid.top - FIT_MARGIN + 0.5);
      expect(highest).toBeGreaterThanOrEqual(stage.boxTop - 0.5);
    },
  );

  it("returns the input unchanged when nothing needs fitting", () => {
    const { stage } = scene(1440, 900, { width: 660, height: 56 });
    const geoms = resolveTapes(stage, PRESETS.desktop, 0.62);
    const fit = fitTapes(geoms, stage, {
      avoid: [{ left: 0, right: 10, top: 5000, bottom: 5050 }],
      ceiling: 64,
    });
    expect(fit).toEqual({ geoms, ok: true });
    expect(fit.geoms[0]).not.toBe(geoms[0]);
  });

  const raised = { left: 390, right: 1050, top: 700, bottom: 900 };

  it("lifts all strips together when there is room above them", () => {
    const { stage } = scene(1440, 900, { width: 660, height: 56 });
    const geoms = resolveTapes(stage, PRESETS.desktop, 0.62);
    const fit = fitTapes(geoms, stage, { avoid: [raised], ceiling: 64 });
    expect(fit.ok).toBe(true);
    const lifts = fit.geoms.map((g, i) => geoms[i].cy - g.cy);
    expect(lifts[0]).toBeGreaterThan(0);
    lifts.forEach((lift) => expect(lift).toBeCloseTo(lifts[0]));
    fit.geoms.forEach((g, i) => expect(g.thick).toBe(geoms[i].thick));
    expect(extent(fit.geoms, stage, raised).lowest).toBeLessThanOrEqual(700 - FIT_MARGIN + 0.5);
  });

  it("keeps clear of every element it is given, such as the date in the corner", () => {
    const { stage, avoid } = scene(1440, 900, { width: 660, height: 56 });
    const geoms = resolveTapes(stage, PRESETS.desktop, 0.62);
    const corner = { left: 1300, right: 1418, top: 640, bottom: 660 };
    const buttonsOnly = fitTapes(geoms, stage, { avoid: [avoid], ceiling: 64 });
    const withCorner = fitTapes(geoms, stage, { avoid: [avoid, corner], ceiling: 64 });
    expect(buttonsOnly.geoms.map((g) => g.cy)).toEqual(geoms.map((g) => g.cy));
    expect(withCorner.ok).toBe(true);
    expect(withCorner.geoms[2].cy).toBeLessThan(geoms[2].cy);
    expect(extent(withCorner.geoms, stage, corner).lowest).toBeLessThanOrEqual(
      corner.top - FIT_MARGIN + 0.5,
    );
  });

  it("thins the strips instead when lifting would push them under the bar", () => {
    const { stage } = scene(1440, 900, { width: 660, height: 56 });
    const geoms = resolveTapes(stage, PRESETS.desktop, 0.62);
    const fit = fitTapes(geoms, stage, { avoid: [raised], ceiling: 250 });
    fit.geoms.forEach((g, i) => {
      expect(g.thick).toBeLessThan(geoms[i].thick);
      expect(g.drift).toBe(Math.round(g.thick * 0.35));
    });
  });

  it("keeps every phone strip under the bar and clear of the buttons on portrait phones", () => {
    for (let w = 320; w <= 430; w += 10) {
      for (let h = 568; h <= 1000; h += 16) {
        const { stage, avoid } = scene(w, h, { width: w - 32, height: 152 });
        const fit = fitTapes(resolveTapes(stage, PRESETS.mobile, PRINT_SCALE.mobile), stage, {
          avoid: [avoid],
          ceiling: stage.boxTop,
          dropBelowCeiling: true,
        });
        expect(fit.ok).toBe(true);
        const { lowest, highest } = extent(fit.geoms, stage, avoid);
        expect(lowest).toBeLessThanOrEqual(avoid.top - FIT_MARGIN + 0.5);
        expect(highest).toBeGreaterThanOrEqual(stage.boxTop - 0.5);
      }
    }
  });

  describe("dropping below the ceiling", () => {
    const { stage, avoid } = scene(390, 424, { width: 358, height: 124 });
    const high = resolveTapes(stage, PRESETS.mobile, PRINT_SCALE.mobile).map((g) => ({
      ...g,
      cy: g.cy - 12,
    }));
    const options = { avoid: [avoid], ceiling: stage.boxTop };

    it("leaves a group that starts above the bar where it is without it, as desktop does", () => {
      expect(fitTapes(high, stage, options).geoms).toEqual(high);
    });

    it("drops the group just under the bar, whole, when the buttons leave room", () => {
      const fit = fitTapes(high, stage, { ...options, dropBelowCeiling: true });
      expect(fit.ok).toBe(true);
      const drop = fit.geoms[0].cy - high[0].cy;
      expect(drop).toBeGreaterThan(0);
      fit.geoms.forEach((g, i) => {
        expect(g.cy - high[i].cy).toBeCloseTo(drop);
        expect(g.thick).toBe(high[i].thick);
      });
      const { lowest, highest } = extent(fit.geoms, stage, avoid);
      expect(highest).toBeGreaterThanOrEqual(stage.boxTop - 0.5);
      expect(highest).toBeLessThan(stage.boxTop + 0.5);
      expect(lowest).toBeLessThanOrEqual(avoid.top - FIT_MARGIN + 0.5);
    });

    it("leaves the group where it is, unthinned, when dropping would reach the buttons", () => {
      const { lowest } = extent(high, stage, avoid);
      const tight = { ...avoid, top: lowest + FIT_MARGIN + 2 };
      const fit = fitTapes(high, stage, { ...options, avoid: [tight], dropBelowCeiling: true });
      expect(fit).toEqual({ geoms: high, ok: true });
    });
  });

  it("reports failure instead of looping when the constraint cannot be met", () => {
    const { stage } = scene(1440, 900, { width: 660, height: 56 });
    const fit = fitTapes(resolveTapes(stage, PRESETS.desktop, 0.62), stage, {
      avoid: [{ left: 0, right: 1440, top: -500, bottom: 900 }],
      ceiling: 0,
    });
    expect(fit.ok).toBe(false);
  });
});

describe("printLayout", () => {
  const { stage } = scene(1440, 900, { width: 660, height: 56 });
  const measure = (size: number): number => size * 12.72;

  it.each(resolveTapes(stage, PRESETS.desktop, 0.62).map((g, i) => [i, g] as const))(
    "centres one whole phrase on strip %i and covers the whole strip",
    (_i, g) => {
      const run = printLayout(g, measure);
      const size = g.thick * g.printScale;
      const unit = measure(size) + PRINT_GAP_EM * size;
      const centred = g.len / 2 - measure(size) / 2 + g.offset * unit;
      expect(((centred - run.start) / unit) % 1).toBeCloseTo(0);
      expect(run.start).toBeLessThanOrEqual(0);
      expect(run.start + run.repeats * unit).toBeGreaterThanOrEqual(g.len);
    },
  );
});
