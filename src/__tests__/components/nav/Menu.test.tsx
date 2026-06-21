jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu } from "@/components/nav/Menu";
import { NAVLINKS, SITE } from "@/lib/constants";

describe("Menu", () => {
  it("renders nothing when closed", () => {
    render(<Menu open={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the dialog with all NAVLINKS when open", () => {
    render(<Menu open={true} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: /site menu/i });
    expect(dialog).toBeInTheDocument();
    for (const link of NAVLINKS) {
      expect(screen.getByText(link.t)).toBeInTheDocument();
      expect(screen.getByText(link.n)).toBeInTheDocument();
    }
  });

  it("includes the footer row: Download CV, mailto, tel, theme toggle", () => {
    render(<Menu open={true} onClose={() => {}} />);
    expect(screen.getByRole("link", { name: "Download CV" })).toHaveAttribute("href", "/recruiter");
    expect(screen.getByRole("link", { name: SITE.email })).toHaveAttribute("href", `mailto:${SITE.email}`);
    expect(screen.getByRole("link", { name: SITE.phone })).toHaveAttribute("href", SITE.phoneHref);
    // Theme toggle text reflects the *target* state (Dark mode when currently light).
    expect(screen.getByText(/Dark mode/i)).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<Menu open={true} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when a nav link is clicked", async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(<Menu open={true} onClose={onClose} />);
    await user.click(screen.getByText(NAVLINKS[0].t));
    expect(onClose).toHaveBeenCalled();
  });
});
