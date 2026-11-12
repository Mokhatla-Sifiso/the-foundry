import {
  PAGE_PRESETS,
  PERSPECTIVE_ORIGIN,
  PRESETS,
  PRINT_SCALE,
  WORDS,
  edgeExtremeIn,
  layoutFor,
  projectStripPoint,
  resolveTapes,
  type Stage,
  type TapeGeometry,
} from "@/lib/tape/geometry";

describe("layoutFor", () => {
  it.each([
    [320, "mobile"],
    [719, "mobile"],
    [720, "tablet"],
    [1199, "tablet"],
    [1200, "desktop"],
    [2560, "desktop"],
  ])("puts a %ipx stage on the %s presets", (width, layout) => {
    expect(layoutFor(width)).toBe(layout);
  });
});

describe("resolveTapes", () => {
  // Desktop reference frame: bar bottom at 64px, buttons 56px tall, 40px from the bottom.
  const stage: Stage = { width: 1440, height: 900, boxTop: 64, boxHeight: 724 };
  const geoms = resolveTapes(stage, PRESETS.desktop, PRINT_SCALE.desktop);

  it("places each strip in the scene box and makes it long enough to run off both edges", () => {
    geoms.forEach((g, i) => {
      expect(g.cy).toBeCloseTo(stage.boxTop + stage.boxHeight * PRESETS.desktop[i].cy);
      expect(g.len).toBe(stage.width * 2.2);
    });
  });

  it("scales thickness back up for the tilt, so each strip reads at its specified share", () => {
    geoms.forEach((g, i) => {
      const specified = stage.boxHeight * PRESETS.desktop[i].thick * 1.12;
      expect(g.thick * Math.cos((g.rx * Math.PI) / 180)).toBeCloseTo(specified);
      expect(g.drift).toBe(Math.round(g.thick * 0.35));
    });
  });

  it("tilts and lights every strip differently", () => {
    expect(new Set(geoms.map((g) => g.rx)).size).toBe(3);
    expect(new Set(geoms.map((g) => g.bloom)).size).toBe(3);
  });

  it("centres the whole phrase at the layout's print size unless a preset says otherwise", () => {
    geoms.forEach((g) => {
      expect(g.word).toBeUndefined();
      expect(g.printScale).toBe(PRINT_SCALE.desktop);
    });
    const phone: Stage = { width: 390, height: 844, boxTop: 64, boxHeight: 571 };
    resolveTapes(phone, PRESETS.mobile, PRINT_SCALE.mobile).forEach((g, i) => {
      expect(WORDS[g.word ?? -1]).toBe(WORDS[i]);
      expect(g.printScale).toBe(0.56);
    });
  });
});

describe("presets", () => {
  // The phone strips grew in G17; desktop, tablet and the pages' strip stay as approved.
  it("keeps the desktop and tablet strips and the print sizes as approved", () => {
    expect(PRESETS.desktop).toEqual([
      { cy: 0.27, rz: 5, ry: -16, tz: 40, thick: 0.2, far: "right", offset: -0.04, delay: 0 },
      { cy: 0.52, rz: -11, ry: 15, tz: 110, thick: 0.21, far: "left", offset: 0.05, delay: -7 },
      { cy: 0.78, rz: 2, ry: -12, tz: 70, thick: 0.19, far: "right", offset: 0, delay: -13 },
    ]);
    expect(PRESETS.tablet).toEqual([
      { cy: 0.27, rz: 5, ry: -16, tz: 40, thick: 0.19, far: "right", offset: -0.04, delay: 0 },
      { cy: 0.52, rz: -12, ry: 15, tz: 100, thick: 0.2, far: "left", offset: 0.05, delay: -7 },
      { cy: 0.78, rz: 2, ry: -12, tz: 60, thick: 0.18, far: "right", offset: 0, delay: -13 },
    ]);
    expect(PRINT_SCALE).toEqual({ desktop: 0.62, tablet: 0.62, mobile: 0.46 });
  });

  it("keeps the pages' quieter strip centring the whole phrase on every layout", () => {
    for (const layout of ["desktop", "tablet", "mobile"] as const) {
      expect(PAGE_PRESETS[layout]).toHaveLength(1);
      expect(PAGE_PRESETS[layout][0].word).toBeUndefined();
      expect(PAGE_PRESETS[layout][0].print).toBeUndefined();
    }
  });

  it("gives each phone strip one word of the phrase, in reading order from the top", () => {
    const strips = [...PRESETS.mobile].sort((a, b) => a.cy - b.cy);
    expect(strips.map((p) => WORDS[p.word ?? -1])).toEqual(["Upgrades", "in", "progress"]);
  });
});

describe("projectStripPoint", () => {
  const stage: Stage = { width: 1000, height: 800, boxTop: 0, boxHeight: 800 };
  const flat: TapeGeometry = {
    ...resolveTapes(stage, PRESETS.desktop, 0.62)[0],
    rz: 0,
    ry: 0,
    rx: 0,
    tz: 0,
    cy: 300,
  };

  it("leaves an untransformed strip where it is", () => {
    expect(projectStripPoint(flat, stage, 100, 20)).toEqual({ x: 600, y: 320 });
  });

  it("magnifies a strip brought toward the viewer away from the perspective origin", () => {
    const near = projectStripPoint({ ...flat, tz: 200 }, stage, 100, 20);
    const origin = { x: 1000 * PERSPECTIVE_ORIGIN.x, y: 800 * PERSPECTIVE_ORIGIN.y };
    const k = 1200 / (1200 - 200);
    expect(near.x).toBeCloseTo(origin.x + (600 - origin.x) * k);
    expect(near.y).toBeCloseTo(origin.y + (320 - origin.y) * k);
  });

  it("rotates in the plane of the screen for rotateZ", () => {
    const p = projectStripPoint({ ...flat, rz: 90 }, stage, 100, 0);
    expect(p.x).toBeCloseTo(500);
    expect(p.y).toBeCloseTo(400);
  });
});

describe("edgeExtremeIn", () => {
  const edge = [
    { x: 0, y: 10 },
    { x: 100, y: 30 },
    { x: 200, y: 0 },
  ];

  it("finds the extreme within the span, interpolating at its ends", () => {
    expect(edgeExtremeIn(edge, 50, 150, "max")).toBeCloseTo(30);
    expect(edgeExtremeIn(edge, 50, 150, "min")).toBeCloseTo(15);
    expect(edgeExtremeIn(edge, 150, 300, "min")).toBeCloseTo(0);
  });

  it("is null when the edge never enters the span", () => {
    expect(edgeExtremeIn(edge, 300, 400, "max")).toBeNull();
  });

  it("skips vertical segments", () => {
    expect(
      edgeExtremeIn(
        [
          { x: 0, y: 0 },
          { x: 0, y: 99 },
          { x: 10, y: 5 },
        ],
        0,
        10,
        "max",
      ),
    ).toBeCloseTo(99);
  });
});
