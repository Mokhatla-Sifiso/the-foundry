import {
  FIT_MARGIN,
  PRINT_GAP_EM,
  WORD_MARGIN,
  fitPrint,
  fitTapes,
  printLayout,
  type PrintMetrics,
  type TextSpan,
} from "@/lib/tape/fit";
import {
  PERSPECTIVE,
  PRESETS,
  PRINT_SCALE,
  edgeExtremeIn,
  layoutFor,
  projectStripPoint,
  resolveTapes,
  stripEdge,
  type Rect,
  type Stage,
  type TapeGeometry,
} from "@/lib/tape/geometry";

/** A scene as the gate lays it out: bar 64px tall, buttons 40px above the bottom of the stage. */
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

/** Lowest point any strip reaches over the buttons, and highest point anywhere, at both drift ends. */
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
  // The spec's reference frames (4.1), the smallest supported phone, and the same sizes with the
  // consent banner open (G6), which takes about 250px from the stage on desktop and 420px on phones.
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
      // A finer polyline than the fit uses, so this also proves 48 steps were enough.
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

  // Buttons taller than the scene box allowed for, so the low strip now runs behind them.
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

  // Portrait phones from the smallest supported to the largest reference, every screen height
  // from 568px up: the phone strips are a large share of the scene.
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
    // The phone strips with the banner open, raised so the top one starts above the bar.
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

// Upper-case Onest 900 as measured in the browser, in em: the phrase and each of its words.
const metrics: PrintMetrics = {
  phrase: 12.721,
  words: [
    { left: 0, width: 5.564 },
    { left: 5.844, width: 1.078 },
    { left: 7.202, width: 5.519 },
  ],
};

/**
 * The gate as a phone lays it out: the date (13px) sits 12px above the stacked buttons (128px
 * at 390 wide) and ends the scene box, as measured in the browser.
 */
function phone(width: number, height: number): Stage {
  const boxTop = 64;
  const dateTop = height - 40 - 128 - 12 - 13;
  return { width, height, boxTop, boxHeight: dateTop - 16 - boxTop };
}

/** Screen x of a word's two ends along a strip's centre line, with the strip at rest. */
function wordEnds(g: TapeGeometry, stage: Stage, word: TextSpan): [number, number] {
  const size = g.thick * g.printScale;
  const mid = g.offset * (metrics.phrase + PRINT_GAP_EM) * size;
  const half = (word.width * size) / 2;
  return [
    projectStripPoint(g, stage, mid - half, 0).x,
    projectStripPoint(g, stage, mid + half, 0).x,
  ];
}

describe("printLayout", () => {
  const { stage } = scene(1440, 900, { width: 660, height: 56 });

  /** Where the centred focus starts, and the repeat length, for a strip. */
  function expected(g: TapeGeometry, focus: TextSpan): { centred: number; unit: number } {
    const size = g.thick * g.printScale;
    const unit = (metrics.phrase + PRINT_GAP_EM) * size;
    return {
      unit,
      centred: g.len / 2 - (focus.left + focus.width / 2) * size + g.offset * unit,
    };
  }

  function expectCovers(g: TapeGeometry, focus: TextSpan): void {
    const run = printLayout(g, metrics);
    const { centred, unit } = expected(g, focus);
    // Some repeat starts exactly where the one carrying the centred focus does.
    expect(((centred - run.start) / unit) % 1).toBeCloseTo(0);
    expect(run.start).toBeLessThanOrEqual(0);
    expect(run.start + run.repeats * unit).toBeGreaterThanOrEqual(g.len);
  }

  it.each(resolveTapes(stage, PRESETS.desktop, 0.62).map((g, i) => [i, g] as const))(
    "centres one whole phrase on strip %i and covers the whole strip",
    (_i, g) => expectCovers(g, { left: 0, width: metrics.phrase }),
  );

  it.each(resolveTapes(phone(390, 844), PRESETS.mobile, 0.46).map((g, i) => [i, g] as const))(
    "centres its own word on phone strip %i, so the strips read the phrase top to bottom",
    (i, g) => {
      expect(g.word).toBe(i);
      expectCovers(g, metrics.words[i]);
    },
  );

  it("centres the whole phrase when the strip's word was not measured", () => {
    const g = resolveTapes(phone(390, 844), PRESETS.mobile, 0.46)[0];
    expect(printLayout(g, { ...metrics, words: [] })).toEqual(
      printLayout({ ...g, word: undefined }, metrics),
    );
  });
});

describe("the phone gate", () => {
  // The target approved with the mockups (G17), measured on screen at the centre of each strip.
  it("draws the strips as thick, and the print as large, as approved at 390 x 844", () => {
    const stage = phone(390, 844);
    for (const g of resolveTapes(stage, PRESETS.mobile, 0.46)) {
      const top = projectStripPoint(g, stage, 0, -g.thick / 2);
      const bottom = projectStripPoint(g, stage, 0, g.thick / 2);
      // Magnification at the strip's centre, which the rotations carry to depth tz cos(rx) cos(ry).
      const cos = (deg: number): number => Math.cos((deg * Math.PI) / 180);
      const k = PERSPECTIVE / (PERSPECTIVE - g.tz * cos(g.rx) * cos(g.ry));
      expect(Math.hypot(top.x - bottom.x, top.y - bottom.y)).toBeGreaterThanOrEqual(105);
      expect(g.thick * g.printScale * k).toBeGreaterThanOrEqual(60);
    }
  });
});

describe("fitPrint", () => {
  it.each([
    [375, 812],
    [390, 844],
    [430, 932],
    [320, 568],
  ])("keeps the approved print size on a %i x %i phone", (w, h) => {
    const stage = phone(w, h);
    for (const g of resolveTapes(stage, PRESETS.mobile, 0.46)) {
      expect(fitPrint(g, stage, metrics)).toBe(g);
    }
  });

  it("shrinks the print, not the strip, so the word stays whole on a tall, narrow phone", () => {
    // A tall cover screen, narrower than any reference frame.
    const stage = phone(344, 882);
    const geoms = resolveTapes(stage, PRESETS.mobile, 0.46);
    const fitted = geoms.map((g) => fitPrint(g, stage, metrics));
    expect(fitted.some((g, i) => g.printScale < geoms[i].printScale)).toBe(true);
    fitted.forEach((g, i) => {
      expect(g.thick).toBe(geoms[i].thick);
      const [left, right] = wordEnds(g, stage, metrics.words[i]);
      expect(left).toBeGreaterThanOrEqual(WORD_MARGIN - 0.5);
      expect(right).toBeLessThanOrEqual(stage.width - WORD_MARGIN + 0.5);
      // As large as fits: a little larger and a word would reach past the margin.
      if (g.printScale < geoms[i].printScale) {
        const [l, r] = wordEnds({ ...g, printScale: g.printScale * 1.01 }, stage, metrics.words[i]);
        expect(l < WORD_MARGIN || r > stage.width - WORD_MARGIN).toBe(true);
      }
    });
  });

  it("leaves strips that centre the whole phrase, and unmeasured words, alone", () => {
    const { stage } = scene(390, 844, { width: 358, height: 124 });
    for (const g of resolveTapes(stage, PRESETS.desktop, 0.62)) {
      expect(fitPrint(g, stage, metrics)).toBe(g);
    }
    const g = resolveTapes(phone(344, 882), PRESETS.mobile, 0.46)[0];
    expect(fitPrint(g, phone(344, 882), { ...metrics, words: [] })).toBe(g);
  });
});
