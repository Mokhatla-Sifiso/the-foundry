jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import { Statement } from "@/components/sections/Statement";
import { STATEMENT } from "@/lib/constants";

describe("Statement", () => {
  it("renders the eyebrow label", () => {
    render(<Statement />);
    expect(screen.getByText(STATEMENT.eyebrow)).toBeInTheDocument();
  });

  it("renders the statement body as an h2 (Hero owns the h1)", () => {
    render(<Statement />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent(STATEMENT.body);
  });

  it("exposes a stable section landmark with an aria-label association", () => {
    const { container } = render(<Statement />);
    const section = container.querySelector("section#statement");
    expect(section).not.toBeNull();
    expect(section?.getAttribute("aria-labelledby")).toBe("statement-heading");
  });
});
