jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import { Reveal } from "@/components/ui/Reveal";

describe("Reveal", () => {
  it("renders its children inside a div", () => {
    render(
      <Reveal>
        <span>shown content</span>
      </Reveal>,
    );
    expect(screen.getByText("shown content")).toBeInTheDocument();
  });

  it("forwards className to the rendered element", () => {
    render(
      <Reveal className="custom-class" data-testid="reveal">
        <span>x</span>
      </Reveal>,
    );
    expect(screen.getByTestId("reveal")).toHaveClass("custom-class");
  });

  it("does not leak framer-only props onto the DOM", () => {
    render(
      <Reveal data-testid="reveal" y={20} delay={0.2}>
        <span>x</span>
      </Reveal>,
    );
    const node = screen.getByTestId("reveal");
    expect(node.hasAttribute("initial")).toBe(false);
    expect(node.hasAttribute("whileInView")).toBe(false);
  });
});
