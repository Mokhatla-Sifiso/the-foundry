import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/primitives/ThemeToggle";

const KEY = "studio-theme";

describe("ThemeToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("is announced as a switch named Dark mode, off in light mode", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch", { name: "Dark mode" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("starts on when the stored theme is dark", () => {
    window.localStorage.setItem(KEY, "dark");
    render(<ThemeToggle />);
    expect(screen.getByRole("switch", { name: "Dark mode" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("switches theme on click, applying and persisting it", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch", { name: "Dark mode" });

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(window.localStorage.getItem(KEY)).toBe("dark");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("toggles from the keyboard with Space and Enter", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch", { name: "Dark mode" });

    await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("keeps the track decorative so only the switch is announced", () => {
    const { container } = render(<ThemeToggle />);
    expect(container.querySelector(".theme-switch-track")).toHaveAttribute("aria-hidden", "true");
  });
});
