jest.mock("framer-motion");
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Nav } from "@/components/nav/Nav";
describe("Nav", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });
  it("renders the mzwakhe. brand linking to #top", () => {
    const { container } = render(<Nav onOpenMenu={() => {}} />);
    const brand = container.querySelector("a.brand") as HTMLAnchorElement;
    expect(brand).not.toBeNull();
    expect(brand.textContent).toBe("mzwakhe.");
    expect(brand.getAttribute("href")).toBe("#top");
  });
  it("renders the Let's talk pill and Menu trigger", () => {
    render(<Nav onOpenMenu={() => {}} />);
    expect(screen.getByRole("link", { name: /let's talk/i })).toHaveAttribute("href", "#contact");
    expect(screen.getByRole("button", { name: /menu/i })).toBeInTheDocument();
  });
  it("calls onOpenMenu when the Menu button is clicked", async () => {
    const open = jest.fn();
    const user = userEvent.setup();
    render(<Nav onOpenMenu={open} />);
    await user.click(screen.getByRole("button", { name: /menu/i }));
    expect(open).toHaveBeenCalledTimes(1);
  });
  it("renders the theme button with an accessible label", () => {
    render(<Nav onOpenMenu={() => {}} />);
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });
});
