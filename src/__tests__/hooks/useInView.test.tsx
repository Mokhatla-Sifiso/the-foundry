import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * `useInView` is the spec's scroll + getBoundingClientRect detector
 * (no IntersectionObserver). Tests:
 *   - Falls back to `seen=true` after the 1500ms safety timer fires
 *     even if no scroll event ever happens.
 *   - Sets `seen=true` synchronously on mount when the element is
 *     already inside the viewport (the immediate `check()` call).
 */

function Probe({ report }: { report: (seen: boolean) => void }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  useEffect(() => report(seen), [seen, report]);
  return <div ref={ref}>probe</div>;
}

describe("useInView", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("flips to seen=true via the 1500ms fallback when no scroll fires", () => {
    // jsdom's default getBoundingClientRect returns all zeros, so the
    // immediate check() succeeds because `r.top (0) < h * (1-0.16)`.
    // To verify the *fallback* path we stub the rect so it sits below
    // the viewport, then advance to the fallback timer.
    const original = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (): DOMRect {
      return {
        top: 9999,
        bottom: 99999,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    };

    const report = jest.fn();
    render(<Probe report={report} />);

    expect(report).toHaveBeenLastCalledWith(false);
    act(() => jest.advanceTimersByTime(1600));
    expect(report).toHaveBeenLastCalledWith(true);

    HTMLElement.prototype.getBoundingClientRect = original;
  });

  it("is seen immediately when the element rect is already in view", () => {
    // Stub the rect so the element appears inside the viewport
    // (top=10 < 84% of 768, bottom=100 > 0).
    const original = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (): DOMRect {
      return {
        top: 10,
        bottom: 100,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    };

    const report = jest.fn();
    render(<Probe report={report} />);
    expect(report).toHaveBeenLastCalledWith(true);

    HTMLElement.prototype.getBoundingClientRect = original;
  });
});
