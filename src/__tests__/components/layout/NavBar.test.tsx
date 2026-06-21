jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavBar } from "@/components/layout/NavBar";

describe("NavBar", () => {
  it("opens the menu when the nav trigger is clicked and closes it via the close button", async () => {
    const user = userEvent.setup();
    render(<NavBar />);

    // Menu starts closed.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click the trigger → dialog appears.
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    expect(screen.getByRole("dialog", { name: /site menu/i })).toBeInTheDocument();

    // Click close → dialog removed.
    await user.click(screen.getByRole("button", { name: /close menu/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
