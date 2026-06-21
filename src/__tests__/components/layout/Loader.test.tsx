import { render, screen } from "@testing-library/react";
import { Loader } from "@/components/layout/Loader";

describe("Loader", () => {
  it("renders the studio mark inside an aria-live overlay", () => {
    render(<Loader />);
    const overlay = screen.getByRole("status", { name: /loading/i });
    expect(overlay).toBeInTheDocument();
    expect(overlay.id).toBe("studio-loader");
    expect(overlay).toHaveClass("studio-loader");
    expect(overlay.textContent).toBe("M");
  });
});
