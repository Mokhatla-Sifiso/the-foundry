import { render } from "@testing-library/react";
import { ThemeScript } from "@/components/ThemeScript";

describe("ThemeScript", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("emits an inline script that reads `studio-theme`", () => {
    const { container } = render(<ThemeScript />);
    const source = container.querySelector("script")?.innerHTML ?? "";
    expect(source).toContain("studio-theme");
    expect(source).toContain("data-theme");
    expect(source).toContain("light");
  });

  it("applies the persisted theme when the script executes", () => {
    window.localStorage.setItem("studio-theme", "dark");
    const { container } = render(<ThemeScript />);
    const source = container.querySelector("script")?.innerHTML ?? "";
    new Function(source)();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("defaults to 'light' when storage is empty", () => {
    const { container } = render(<ThemeScript />);
    const source = container.querySelector("script")?.innerHTML ?? "";
    new Function(source)();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
