jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import { Progress } from "@/components/ui/Progress";

describe("Progress", () => {
  it("renders a fixed-position progress bar marked aria-hidden", () => {
    render(<Progress />);
    const bar = screen.getByTestId("scroll-progress");
    expect(bar).toBeInTheDocument();
    expect(bar.getAttribute("aria-hidden")).toBe("true");
    expect(bar.className).toContain("fixed");
    expect(bar.className).toContain("origin-left");
  });
});
