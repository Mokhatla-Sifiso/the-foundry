jest.mock("framer-motion");

import { act, render } from "@testing-library/react";
import { AISection } from "@/components/sections/AISection";

/**
 * Regression test for the AI section's in-view bg trigger.
 *
 * Earlier iterations had two bugs:
 *   1. `entry.isIntersecting` fired peak the moment any pixel crossed
 *      into view (rather than waiting for the requested ratio).
 *   2. CSS-variable indirection caused Turbopack HMR to silently
 *      cache the previous palette.
 *
 * This test stubs IntersectionObserver so we can drive ratios
 * directly and assert that `.ai--peak` only attaches when the visible
 * fraction reaches the threshold.
 */

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;
type FakeObserver = { callback: ObserverCallback; targets: Element[] };

let observers: FakeObserver[] = [];
let originalObserver: typeof IntersectionObserver | undefined;

beforeAll(() => {
  originalObserver = window.IntersectionObserver;

  class FakeIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    private readonly record: FakeObserver;
    constructor(callback: ObserverCallback) {
      this.record = { callback, targets: [] };
      observers.push(this.record);
    }
    observe(target: Element): void {
      this.record.targets.push(target);
    }
    unobserve(target: Element): void {
      this.record.targets = this.record.targets.filter((t) => t !== target);
    }
    disconnect(): void {
      this.record.targets = [];
    }
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  window.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;
});

afterAll(() => {
  if (originalObserver) window.IntersectionObserver = originalObserver;
});

beforeEach(() => {
  observers = [];
});

function fireRatio(ratio: number): void {
  for (const observer of observers) {
    const entries = observer.targets.map(
      (target) =>
        ({
          isIntersecting: ratio > 0,
          intersectionRatio: ratio,
          target,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: 0,
        }) as IntersectionObserverEntry,
    );
    observer.callback(entries);
  }
}

describe("AISection in-view bg trigger", () => {
  it("does not apply .ai--peak before the threshold is reached", () => {
    const { container } = render(<AISection threshold={0.25} />);
    const section = container.querySelector("#ai") as HTMLElement;
    expect(section.className).not.toMatch(/ai--peak/);

    // 10% visible — below the 25% threshold.
    act(() => fireRatio(0.1));
    expect(section.className).not.toMatch(/ai--peak/);
  });

  it("applies .ai--peak once the section reaches the threshold", () => {
    const { container } = render(<AISection threshold={0.25} />);
    const section = container.querySelector("#ai") as HTMLElement;

    act(() => fireRatio(0.3));
    expect(section.className).toMatch(/ai--peak/);
  });

  it("removes .ai--peak once the section drops back below the threshold (scroll past)", () => {
    const { container } = render(<AISection threshold={0.25} />);
    const section = container.querySelector("#ai") as HTMLElement;

    act(() => fireRatio(0.5));
    expect(section.className).toMatch(/ai--peak/);

    act(() => fireRatio(0.1));
    expect(section.className).not.toMatch(/ai--peak/);
  });
});
