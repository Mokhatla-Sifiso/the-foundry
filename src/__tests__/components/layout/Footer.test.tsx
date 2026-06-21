import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/lib/constants";

describe("Footer", () => {
  it("renders the studio name as a heading, plus email, location, and GoUp", () => {
    render(<Footer />);

    expect(screen.getByRole("heading", { level: 2, name: SITE.name })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: SITE.email })).toHaveAttribute(
      "href",
      `mailto:${SITE.email}`,
    );
    expect(screen.getByLabelText(/location/i)).toHaveTextContent(SITE.location);
    expect(screen.getByRole("button", { name: /scroll back to top/i })).toBeInTheDocument();
  });

  it("shows the current year in the copyright line", () => {
    render(<Footer />);
    expect(
      screen.getByText(new RegExp(`© ${new Date().getFullYear()}`)),
    ).toBeInTheDocument();
  });
});
