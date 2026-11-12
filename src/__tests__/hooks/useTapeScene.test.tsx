import { act, render, renderHook } from "@testing-library/react";
import { useLayoutEffect, useMemo, useRef } from "react";
import { MEASURE_SIZE, useTapeScene, type TapeScene } from "@/hooks/useTapeScene";
import { PRINT_GAP_EM } from "@/lib/tape/fit";
import { PAGE_PRESETS } from "@/lib/tape/geometry";

type Box = { left: number; top: number; width: number; height: number };

/** Each word's place in the phrase, in em, as measured in upper-case Onest 900. */
const WORD_EMS = [
  { left: 0, width: 5.564 },
  { left: 5.844, width: 1.078 },
  { left: 7.202, width: 5.519 },
];

/** jsdom does no layout, so each element reports the box the gate would give it. */
function place(el: HTMLElement, box: Box, client?: { width: number; height: number }): void {
  el.getBoundingClientRect = () =>
    ({
      ...box,
      x: box.left,
      y: box.top,
      right: box.left + box.width,
      bottom: box.top + box.height,
      toJSON: () => ({}),
    }) as DOMRect;
  if (client) {
    Object.defineProperty(el, "clientWidth", { configurable: true, value: client.width });
    Object.defineProperty(el, "clientHeight", { configurable: true, value: client.height });
  }
}

function Harness({
  onScene,
  stageSize = { width: 1440, height: 900 },
  pages = false,
}: {
  onScene: (scene: TapeScene | null) => void;
  stageSize?: { width: number; height: number };
  /** Lay out the pages' single strip with nothing to avoid. */
  pages?: boolean;
}): React.ReactElement {
  const stage = useRef<HTMLDivElement>(null);
  const ceiling = useRef<HTMLDivElement>(null);
  const avoid = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  // Layout effects run before the hook's effect, so the boxes are in place when it measures.
  useLayoutEffect(() => {
    const [s, c, a, m] = [stage.current, ceiling.current, avoid.current, measure.current];
    if (!s || !c || !a || !m) return;
    place(s, { left: 0, top: 0, ...stageSize }, stageSize);
    place(c, { left: 22, top: 14, width: 1396, height: 50 });
    place(a, { left: 390, top: stageSize.height - 96, width: 660, height: 56 });
    place(m, { left: 0, top: 0, width: 12.72 * MEASURE_SIZE, height: 100 });
    Array.from(m.children).forEach((word, i) => {
      const { left, width } = WORD_EMS[i];
      place(word as HTMLElement, {
        left: left * MEASURE_SIZE,
        top: 0,
        width: width * MEASURE_SIZE,
        height: 100,
      });
    });
  }, [stageSize]);
  const boxes = useMemo(() => (pages ? [] : [avoid]), [avoid, pages]);
  onScene(
    useTapeScene({
      stage,
      ceiling,
      avoid: boxes,
      measure,
      presets: pages ? PAGE_PRESETS : undefined,
    }),
  );
  return (
    <div ref={stage}>
      <div ref={ceiling} />
      <div ref={avoid} />
      <span ref={measure}>
        <span>Upgrades</span> <span>in</span> <span>progress</span>
      </span>
    </div>
  );
}

let observed: Element[] = [];
let resize: (() => void) | null = null;
let fontsReady: () => void = () => {};

beforeEach(() => {
  observed = [];
  jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    cb(0);
    return 1;
  });
  jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  global.ResizeObserver = class {
    constructor(cb: () => void) {
      resize = cb;
    }
    observe(el: Element): void {
      observed.push(el);
    }
    unobserve(): void {}
    disconnect(): void {
      resize = null;
    }
  } as unknown as typeof ResizeObserver;
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: new Promise<void>((resolve) => (fontsReady = resolve)) },
  });
});

afterEach(() => jest.restoreAllMocks());

describe("useTapeScene", () => {
  it("lays out three fitted strips for the stage, with the print measured in the real font", () => {
    const scenes: Array<TapeScene | null> = [];
    render(<Harness onScene={(s) => scenes.push(s)} />);
    const scene = scenes.at(-1);
    expect(scene?.layout).toBe("desktop");
    expect(scene?.fitted).toBe(true);
    expect(scene?.strips).toHaveLength(3);
    for (const { print } of scene?.strips ?? []) {
      expect(print.start).toBeLessThanOrEqual(0);
      expect(print.repeats).toBeGreaterThan(1);
    }
  });

  it("centres a different word on each strip on a phone, measured in the real font", () => {
    const scenes: Array<TapeScene | null> = [];
    render(<Harness onScene={(s) => scenes.push(s)} stageSize={{ width: 390, height: 844 }} />);
    const scene = scenes.at(-1);
    expect(scene?.layout).toBe("mobile");
    scene?.strips.forEach(({ geometry: g, print }, i) => {
      expect(g.word).toBe(i);
      const size = g.thick * g.printScale;
      const unit = (12.72 + PRINT_GAP_EM) * size;
      const centre = (WORD_EMS[i].left + WORD_EMS[i].width / 2) * size;
      // Some repeat puts the strip's word exactly at the middle of the strip.
      const repeats = (g.len / 2 - centre - print.start) / unit;
      expect(repeats - Math.round(repeats)).toBeCloseTo(0);
    });
  });

  it("watches the stage and the buttons, and lays out again when either resizes", () => {
    const scenes: Array<TapeScene | null> = [];
    render(<Harness onScene={(s) => scenes.push(s)} />);
    expect(observed).toHaveLength(2);
    const before = scenes.length;
    act(() => resize?.());
    expect(scenes.length).toBeGreaterThan(before);
  });

  it("lays out again once the web font has loaded", async () => {
    const scenes: Array<TapeScene | null> = [];
    render(<Harness onScene={(s) => scenes.push(s)} />);
    const before = scenes.length;
    await act(async () => fontsReady());
    expect(scenes.length).toBeGreaterThan(before);
  });

  it("lays the pages' single strip low across the whole stage when there is nothing to avoid", () => {
    const scenes: Array<TapeScene | null> = [];
    render(<Harness onScene={(s) => scenes.push(s)} pages />);
    const strips = scenes.at(-1)?.strips ?? [];
    expect(strips).toHaveLength(1);
    // The scene box runs from the bar (64px) to the bottom of the 900px stage.
    expect(strips[0].geometry.cy).toBeCloseTo(64 + (900 - 64) * 0.88);
  });

  it("draws no strips when the buttons leave no room for the scene", () => {
    const scenes: Array<TapeScene | null> = [];
    render(<Harness onScene={(s) => scenes.push(s)} stageSize={{ width: 1440, height: 150 }} />);
    expect(scenes.at(-1)).toEqual({ layout: "desktop", strips: [], fitted: false });
  });

  it("waits for a stage that has a size", () => {
    const scenes: Array<TapeScene | null> = [];
    render(<Harness onScene={(s) => scenes.push(s)} stageSize={{ width: 0, height: 0 }} />);
    expect(scenes.at(-1)).toBeNull();
  });

  it("stops watching when unmounted", () => {
    const { unmount } = render(<Harness onScene={() => {}} />);
    unmount();
    expect(resize).toBeNull();
  });

  it("does nothing until its elements exist", () => {
    const { result } = renderHook(() =>
      useTapeScene({
        stage: { current: null },
        ceiling: { current: null },
        avoid: [{ current: null }],
        measure: { current: null },
      }),
    );
    expect(result.current).toBeNull();
  });
});
