import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Nav } from "@/components/layout/Nav";
import { SITE } from "@/lib/constants";

describe("Nav", () => {
  it("renders the studio brand, mailto CTA, theme toggle, and menu trigger", () => {
    render(<Nav onMenuOpen={() => {}} menuOpen={false} />);

    expect(screen.getByText(`${SITE.shortName} Studio`)).toBeInTheDocument();

    const cta = screen.getByRole("link", { name: /let's talk/i });
    expect(cta).toHaveAttribute("href", `mailto:${SITE.email}`);

    expect(screen.getByRole("button", { name: /switch to (light|dark) theme/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
  });

  it("invokes onMenuOpen when the trigger is clicked", async () => {
    const open = jest.fn();
    const user = userEvent.setup();
    render(<Nav onMenuOpen={open} menuOpen={false} />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("reflects the menu state in aria-expanded", () => {
    const { rerender } = render(<Nav onMenuOpen={() => {}} menuOpen={false} />);
    expect(screen.getByRole("button", { name: /open menu/i }).getAttribute("aria-expanded")).toBe("false");

    rerender(<Nav onMenuOpen={() => {}} menuOpen={true} />);
    expect(screen.getByRole("button", { name: /open menu/i }).getAttribute("aria-expanded")).toBe("true");
  });
});
