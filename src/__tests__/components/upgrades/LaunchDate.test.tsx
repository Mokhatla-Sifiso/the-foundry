import { act, fireEvent, render, screen } from "@testing-library/react";
import { LaunchDate } from "@/components/upgrades/LaunchDate";

function mockReducedMotion(reduce: boolean): void {
  window.matchMedia = jest
    .fn()
    .mockReturnValue({ matches: reduce }) as unknown as typeof matchMedia;
}

beforeEach(() => {
  jest.useFakeTimers();
  mockReducedMotion(false);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const x = (): HTMLElement => screen.getByText("X");

describe("LaunchDate", () => {
  it("prints X.11.26 in regular weight", () => {
    const { container } = render(<LaunchDate />);
    expect(container.firstElementChild).toHaveTextContent("X.11.26");
    expect(container.firstElementChild).toHaveClass("ug-date");
    expect(container.querySelector("b, strong")).toBeNull();
  });

  it("glitches the X at a random moment, then settles back to X", () => {
    // 0.5 picks a pause of 3.2 s, then the middle glyph.
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    render(<LaunchDate />);
    expect(x()).not.toHaveClass("is-glitching");
    act(() => jest.advanceTimersByTime(3200));
    expect(x()).toHaveClass("is-glitching");
    expect(x()).toHaveAttribute("data-glyph", "/");
    fireEvent.animationEnd(x());
    expect(x()).not.toHaveClass("is-glitching");
    expect(x()).toHaveAttribute("data-glyph", "X");
  });

  it("keeps glitching, sometimes twice in quick succession", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.1);
    render(<LaunchDate />);
    act(() => jest.advanceTimersByTime(160));
    expect(x()).toHaveClass("is-glitching");
    fireEvent.animationEnd(x());
    act(() => jest.advanceTimersByTime(160));
    expect(x()).toHaveClass("is-glitching");
  });

  it("stays still for visitors who reduce motion", () => {
    mockReducedMotion(true);
    render(<LaunchDate />);
    act(() => jest.advanceTimersByTime(60_000));
    expect(x()).not.toHaveClass("is-glitching");
  });

  it("stops scheduling glitches once it is gone", () => {
    const clear = jest.spyOn(window, "clearTimeout");
    const { unmount } = render(<LaunchDate />);
    unmount();
    expect(clear).toHaveBeenCalled();
  });
});
