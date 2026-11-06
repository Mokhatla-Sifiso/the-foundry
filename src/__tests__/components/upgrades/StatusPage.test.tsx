import { render, screen } from "@testing-library/react";
import { StatusPage } from "@/components/upgrades/StatusPage";
import { confirmView, unsubscribeView } from "@/lib/updates/pages";

jest.mock("@/hooks/useTapeScene", () => ({
  ...jest.requireActual("@/hooks/useTapeScene"),
  useTapeScene: () => null,
}));

const TOKEN = "A".repeat(43);

describe("StatusPage", () => {
  it("names the page with its title and keeps the top bar", () => {
    render(<StatusPage view={confirmView({ status: "confirmed" })} />);
    expect(screen.getByRole("heading", { level: 1, name: "You're on the list" })).toBeVisible();
    expect(screen.getByRole("switch", { name: "Dark mode" })).toBeInTheDocument();
  });

  it("posts the token from a plain form, so it works without JavaScript", () => {
    render(<StatusPage view={confirmView({ token: TOKEN })} />);
    const button = screen.getByRole("button", { name: "Confirm" });
    const form = button.closest("form");
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveAttribute("action", "/api/updates/confirm");
    expect(form?.querySelector<HTMLInputElement>('input[name="token"]')?.value).toBe(TOKEN);
  });

  it("announces a retry line as an alert above the action", () => {
    render(<StatusPage view={unsubscribeView({ status: "error", token: TOKEN })} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Try again.");
    expect(screen.getByRole("button", { name: "Unsubscribe" })).toBeInTheDocument();
  });

  it("links onward when there is nothing to submit", () => {
    render(<StatusPage view={confirmView({ status: "expired" })} />);
    expect(screen.getByRole("link", { name: "Sign up again" })).toHaveAttribute(
      "href",
      "/upgrades",
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("hides the tape from assistive technology", () => {
    const { container } = render(<StatusPage view={confirmView({})} />);
    expect(container.querySelector(".ug-tapes")).toHaveAttribute("aria-hidden", "true");
  });
});
