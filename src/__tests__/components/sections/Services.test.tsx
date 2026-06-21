jest.mock("framer-motion");

import { render, screen } from "@testing-library/react";
import { Services } from "@/components/sections/Services";
import { SERVICES } from "@/lib/constants";

describe("Services", () => {
  it("renders the section heading", () => {
    render(<Services />);
    expect(screen.getByRole("heading", { level: 2, name: /services/i })).toBeInTheDocument();
  });

  it("renders one article per service from the SERVICES constant", () => {
    const { container } = render(<Services />);
    const articles = container.querySelectorAll("article");
    expect(articles.length).toBe(SERVICES.length);

    for (let i = 0; i < SERVICES.length; i += 1) {
      expect(screen.getByTestId(`service-card-${i}`)).toBeInTheDocument();
    }
  });

  it("assigns a stacking top offset and z-index per card", () => {
    render(<Services />);

    for (let i = 0; i < SERVICES.length; i += 1) {
      const card = screen.getByTestId(`service-card-${i}`);
      const style = card.getAttribute("style") ?? "";
      expect(style).toContain(`top: ${88 + i * 18}px`);
      expect(style).toContain(`z-index: ${i + 1}`);
    }
  });

  it("renders every service's titleLineOne", () => {
    render(<Services />);
    for (const service of SERVICES) {
      expect(screen.getByRole("heading", { level: 3, name: new RegExp(service.titleLineOne, "i") })).toBeInTheDocument();
    }
  });
});
