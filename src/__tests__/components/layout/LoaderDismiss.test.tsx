import { act, render } from "@testing-library/react";
import { LoaderDismiss } from "@/components/layout/LoaderDismiss";

beforeEach(() => {
  jest.useFakeTimers();
  document.body.innerHTML = '<div id="studio-loader" class="studio-loader"></div>';
});

afterEach(() => {
  jest.useRealTimers();
  document.body.innerHTML = "";
});

describe("LoaderDismiss", () => {
  it("adds .hide after the dwell timeout and removes the node after the fade timeout", () => {
    render(<LoaderDismiss />);

    const overlay = (): HTMLElement | null => document.getElementById("studio-loader");

    // Before any timer fires.
    expect(overlay()?.classList.contains("hide")).toBe(false);

    // Dwell time elapses → fade class added.
    act(() => jest.advanceTimersByTime(800));
    expect(overlay()?.classList.contains("hide")).toBe(true);

    // Fade duration elapses → element removed.
    act(() => jest.advanceTimersByTime(600));
    expect(overlay()).toBeNull();
  });

  it("does nothing when the loader element is absent", () => {
    document.body.innerHTML = "";
    expect(() => render(<LoaderDismiss />)).not.toThrow();
  });
});
