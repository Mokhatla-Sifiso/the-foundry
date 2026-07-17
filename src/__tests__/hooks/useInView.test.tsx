import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { useInView } from "@/hooks/useInView";

function Probe({ report }: { report: (seen: boolean) => void }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  useEffect(() => report(seen), [seen, report]);
  return <div ref={ref}>probe</div>;
}

type Entries = Array<{ isIntersecting: boolean }>;
type Cb = (entries: Entries) => void;
type IOHolder = { IntersectionObserver: unknown };

describe("useInView", () => {
  const original = (globalThis as unknown as IOHolder).IntersectionObserver;
  let fire: Cb | undefined;
  let disconnectSpy: jest.Mock;
  let observeSpy: jest.Mock;

  beforeEach(() => {
    fire = undefined;
    disconnectSpy = jest.fn();
    observeSpy = jest.fn();
    class MockIO {
      constructor(cb: Cb) {
        fire = cb;
      }
      observe = observeSpy;
      disconnect = disconnectSpy;
      unobserve = jest.fn();
      takeRecords = jest.fn();
    }
    (globalThis as unknown as IOHolder).IntersectionObserver = MockIO;
  });

  afterEach(() => {
    (globalThis as unknown as IOHolder).IntersectionObserver = original;
  });

  it("observes the element and starts unseen", () => {
    const report = jest.fn();
    render(<Probe report={report} />);
    expect(observeSpy).toHaveBeenCalled();
    expect(report).toHaveBeenLastCalledWith(false);
  });

  it("stays unseen while the element has not entered the viewport", () => {
    const report = jest.fn();
    render(<Probe report={report} />);
    act(() => fire?.([{ isIntersecting: false }]));
    expect(report).toHaveBeenLastCalledWith(false);
  });

  it("never reveals on a timer: below-the-fold content waits for a real intersection", () => {
    jest.useFakeTimers();
    const report = jest.fn();
    render(<Probe report={report} />);
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(report).toHaveBeenLastCalledWith(false);
    jest.useRealTimers();
  });

  it("flips to seen and stops observing once the element intersects", () => {
    const report = jest.fn();
    render(<Probe report={report} />);
    act(() => fire?.([{ isIntersecting: true }]));
    expect(report).toHaveBeenLastCalledWith(true);
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it("falls back to visible when IntersectionObserver is unsupported", () => {
    (globalThis as unknown as IOHolder).IntersectionObserver = undefined;
    const raf = jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback): number => {
        cb(0);
        return 1;
      });
    const report = jest.fn();
    render(<Probe report={report} />);
    expect(report).toHaveBeenLastCalledWith(true);
    raf.mockRestore();
  });
});
