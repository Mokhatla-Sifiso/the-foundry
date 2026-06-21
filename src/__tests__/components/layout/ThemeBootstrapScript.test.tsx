import { render } from "@testing-library/react";
import { ThemeBootstrapScript } from "@/components/layout/ThemeBootstrapScript";
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/lib/theme-preference";

describe("ThemeBootstrapScript", () => {
  it("emits an inline script that reads the storage key and writes the data-theme attribute", () => {
    const { container } = render(<ThemeBootstrapScript />);
    const script = container.querySelector("script");

    expect(script).not.toBeNull();
    const source = script?.innerHTML ?? "";
    expect(source).toContain(JSON.stringify(THEME_STORAGE_KEY));
    expect(source).toContain(JSON.stringify(THEME_ATTRIBUTE));
    expect(source).toContain('"light"');
    expect(source).toContain('"dark"');
  });

  it("applies the persisted theme when the script is evaluated", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);

    const { container } = render(<ThemeBootstrapScript />);
    const source = container.querySelector("script")?.innerHTML ?? "";

    new Function(source)();

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });

  it("ignores a corrupted stored value", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "neon");
    document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");

    const { container } = render(<ThemeBootstrapScript />);
    const source = container.querySelector("script")?.innerHTML ?? "";

    new Function(source)();

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("light");
  });
});
