import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { useInView } from "@/hooks/useInView";

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

interface FakeObserver {
  callback: ObserverCallback;
  observed: Element[];
}

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
      this.record = { callback, observed: [] };
      observers.push(this.record);
    }
    observe(target: Element): void {
      this.record.observed.push(target);
    }
    unobserve(target: Element): void {
      this.record.observed = this.record.observed.filter((el) => el !== target);
    }
    disconnect(): void {
      this.record.observed = [];
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

function fireIntersection(isIntersecting: boolean): void {
  for (const observer of observers) {
    const entries = observer.observed.map(
      (target) =>
        ({
          isIntersecting,
          target,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: 0,
        }) as IntersectionObserverEntry,
    );
    observer.callback(entries);
  }
}

function Probe({ once = true, report }: { once?: boolean; report: (inView: boolean) => void }) {
  const { ref, inView } = useInView<HTMLDivElement>({ once });
  useEffect(() => report(inView), [inView, report]);
  return <div ref={ref}>probe</div>;
}

describe("useInView", () => {
  it("reports inView=true after the element intersects", () => {
    const report = jest.fn();
    render(<Probe report={report} />);

    act(() => fireIntersection(true));

    expect(report).toHaveBeenLastCalledWith(true);
  });

  it("flips back to false when once=false and element leaves the viewport", () => {
    const report = jest.fn();
    render(<Probe once={false} report={report} />);

    act(() => fireIntersection(true));
    expect(report).toHaveBeenLastCalledWith(true);

    act(() => fireIntersection(false));
    expect(report).toHaveBeenLastCalledWith(false);
  });
});
