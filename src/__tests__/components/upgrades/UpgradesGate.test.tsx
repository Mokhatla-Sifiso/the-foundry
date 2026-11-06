import { render, screen, within } from "@testing-library/react";
import { UpgradesGate } from "@/components/upgrades/UpgradesGate";

jest.mock("@/hooks/useTapeScene", () => ({
  ...jest.requireActual("@/hooks/useTapeScene"),
  useTapeScene: () => null,
}));

describe("UpgradesGate", () => {
  it("names the page with a visually hidden heading", () => {
    render(<UpgradesGate />);
    expect(screen.getByRole("heading", { level: 1, name: "Upgrades in progress" })).toHaveClass(
      "sr-only",
    );
  });

  it("shows only the brand and the theme toggle in the top bar", () => {
    render(<UpgradesGate />);
    const bar = screen.getByRole("banner");
    expect(within(bar).getByRole("link", { name: /^mzwakhe/ })).toHaveAttribute("href", "/");
    expect(within(bar).getByRole("switch", { name: "Dark mode" })).toBeInTheDocument();
    expect(within(bar).getAllByRole("link")).toHaveLength(1);
  });

  it("offers exactly two actions, the way back first", () => {
    render(<UpgradesGate />);
    const actions = within(screen.getByRole("main")).getAllByRole("button");
    expect(actions.map((b) => b.textContent)).toEqual([
      "Go to previous portfolio version for now",
      "Notify me when the updates are done",
    ]);
    expect(actions[1]).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("makes the way back a plain form POST, so it works without JavaScript", () => {
    render(<UpgradesGate returnPath="/guest?token=x" />);
    const button = screen.getByRole("button", { name: "Go to previous portfolio version for now" });
    const form = button.closest("form");
    expect(button).toHaveAttribute("type", "submit");
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveAttribute("action", "/api/site-access");
    expect(form?.querySelector<HTMLInputElement>('input[name="return"]')?.value).toBe(
      "/guest?token=x",
    );
  });

  it("returns to the home page by default", () => {
    render(<UpgradesGate />);
    expect(document.querySelector<HTMLInputElement>('input[name="return"]')?.value).toBe("/");
  });

  it("hides the tape and the background from assistive technology", () => {
    const { container } = render(<UpgradesGate />);
    for (const selector of [".ug-tapes", ".ug-glow", ".ug-vignette"]) {
      expect(container.querySelector(selector)).toHaveAttribute("aria-hidden", "true");
    }
  });
});
