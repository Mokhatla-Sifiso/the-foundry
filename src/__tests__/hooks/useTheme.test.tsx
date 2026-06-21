import { act, renderHook } from "@testing-library/react";
import { useTheme } from "@/hooks/useTheme";
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/lib/theme-preference";

describe("useTheme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  });

  it("reads the persisted theme straight from the external store", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });

  it("toggle switches the theme and persists it", () => {
    const { result } = renderHook(() => useTheme("light"));

    act(() => result.current.toggle());

    expect(result.current.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });

  it("setTheme writes the supplied value without toggling", () => {
    const { result } = renderHook(() => useTheme("light"));

    act(() => result.current.setTheme("dark"));
    expect(result.current.theme).toBe("dark");

    act(() => result.current.setTheme("dark"));
    expect(result.current.theme).toBe("dark");

    act(() => result.current.setTheme("light"));
    expect(result.current.theme).toBe("light");
  });
});
