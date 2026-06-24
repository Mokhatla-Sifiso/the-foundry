import { act, render } from "@testing-library/react";
import { Loader } from "@/components/Loader";
beforeEach(() => {
  jest.useFakeTimers();
  document.body.innerHTML =
    '<div id="loader"><div class="ld-ring"></div><div class="ld-brand">mzwakhe<span>.</span></div><div class="ld-sub">Loading experience</div></div>';
});
afterEach(() => {
  jest.useRealTimers();
  document.body.innerHTML = "";
});
describe("Loader", () => {
  it("renders nothing itself (just runs the timers)", () => {
    const { container } = render(<Loader />);
    expect(container.firstChild).toBeNull();
  });
  it("adds .hide at 600ms and removes the #loader element at 1400ms", () => {
    render(<Loader />);
    expect(document.getElementById("loader")?.classList.contains("hide")).toBe(false);
    act(() => jest.advanceTimersByTime(600));
    expect(document.getElementById("loader")?.classList.contains("hide")).toBe(true);
    act(() => jest.advanceTimersByTime(800));
    expect(document.getElementById("loader")).toBeNull();
  });
  it("does nothing when the loader element is missing", () => {
    document.body.innerHTML = "";
    expect(() => render(<Loader />)).not.toThrow();
    act(() => jest.advanceTimersByTime(2000));
  });
});
