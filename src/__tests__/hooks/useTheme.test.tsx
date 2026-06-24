import { act, renderHook } from "@testing-library/react";
import { useTheme } from "@/hooks/useTheme";
const KEY = "studio-theme";
describe("useTheme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });
  it("starts at 'light' before hydration, then resolves from localStorage", () => {
    window.localStorage.setItem(KEY, "dark");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
  it("toggles between light and dark, persisting + applying each time", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
    act(() => result.current.toggle());
    expect(result.current.theme).toBe("dark");
    expect(window.localStorage.getItem(KEY)).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    act(() => result.current.toggle());
    expect(result.current.theme).toBe("light");
    expect(window.localStorage.getItem(KEY)).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
  it("setTheme writes the supplied value without flipping", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("dark"));
    expect(result.current.theme).toBe("dark");
    expect(window.localStorage.getItem(KEY)).toBe("dark");
  });
});
