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
        avoid,
        ceiling: stage.boxTop,
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
      avoid: { left: 0, right: 10, top: 5000, bottom: 5050 },
      ceiling: 64,
    });
    expect(fit).toEqual({ geoms, ok: true });
    expect(fit.geoms[0]).not.toBe(geoms[0]);
  });

  const raised = { left: 390, right: 1050, top: 700, bottom: 900 };

  it("lifts all strips together when there is room above them", () => {
    const { stage } = scene(1440, 900, { width: 660, height: 56 });
    const geoms = resolveTapes(stage, PRESETS.desktop, 0.62);
    const fit = fitTapes(geoms, stage, { avoid: raised, ceiling: 64 });
    expect(fit.ok).toBe(true);
    const lifts = fit.geoms.map((g, i) => geoms[i].cy - g.cy);
    expect(lifts[0]).toBeGreaterThan(0);
    lifts.forEach((lift) => expect(lift).toBeCloseTo(lifts[0]));
    fit.geoms.forEach((g, i) => expect(g.thick).toBe(geoms[i].thick));
    expect(extent(fit.geoms, stage, raised).lowest).toBeLessThanOrEqual(700 - FIT_MARGIN + 0.5);
  });

  it("thins the strips instead when lifting would push them under the bar", () => {
    const { stage } = scene(1440, 900, { width: 660, height: 56 });
    const geoms = resolveTapes(stage, PRESETS.desktop, 0.62);
    const fit = fitTapes(geoms, stage, { avoid: raised, ceiling: 250 });
    fit.geoms.forEach((g, i) => {
      expect(g.thick).toBeLessThan(geoms[i].thick);
      expect(g.drift).toBe(Math.round(g.thick * 0.35));
    });
  });

  it("reports failure instead of looping when the constraint cannot be met", () => {
    const { stage } = scene(1440, 900, { width: 660, height: 56 });
    const fit = fitTapes(resolveTapes(stage, PRESETS.desktop, 0.62), stage, {
      avoid: { left: 0, right: 1440, top: -500, bottom: 900 },
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
