jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu } from "@/components/layout/Menu";
import { NAVLINKS } from "@/lib/constants";

describe("Menu", () => {
  it("does not render any dialog when closed", () => {
    render(<Menu open={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders an accessible dialog with every NAVLINK when open", () => {
    render(<Menu open={true} onClose={() => {}} />);

    const dialog = screen.getByRole("dialog", { name: /site menu/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    for (const link of NAVLINKS) {
      expect(screen.getByRole("link", { name: new RegExp(link.label, "i") })).toBeInTheDocument();
    }
  });

  it("invokes onClose when the close button is clicked", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<Menu open={true} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /close menu/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose when Escape is pressed", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<Menu open={true} onClose={onClose} />);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("invokes onClose when a nav link is clicked so anchor scrolls fire after the overlay is gone", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<Menu open={true} onClose={onClose} />);

    await user.click(screen.getByRole("link", { name: new RegExp(NAVLINKS[0].label, "i") }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not register Escape handler when closed", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<Menu open={false} onClose={onClose} />);

    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });
});
