import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoUp } from "@/components/layout/GoUp";

describe("GoUp", () => {
  let scrollTo: jest.SpyInstance;

  beforeEach(() => {
    scrollTo = jest
      .spyOn(window, "scrollTo")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    scrollTo.mockRestore();
  });

  it("smoothly scrolls the window to the top when clicked", async () => {
    const user = userEvent.setup();
    render(<GoUp />);

    await user.click(screen.getByRole("button", { name: /scroll back to top/i }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
