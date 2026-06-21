import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the name as the top-level heading", () => {
    render(<HomePage />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/Mzwakhe Mokhatla/i);
  });

  it("flags the page as the construction shell", () => {
    render(<HomePage />);
    expect(screen.getByLabelText(/under construction/i)).toBeInTheDocument();
  });
});
