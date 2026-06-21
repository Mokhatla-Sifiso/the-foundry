jest.mock("framer-motion");
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...rest} />
  ),
}));

import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import { SERVICES, SITE, STATEMENT } from "@/lib/constants";

describe("HomePage", () => {
  it("composes the Hero as the page's primary heading", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: SITE.name })).toBeInTheDocument();
  });

  it("includes the role and tagline meta", () => {
    render(<HomePage />);
    expect(screen.getByText(SITE.role)).toBeInTheDocument();
    expect(screen.getByText(SITE.tagline)).toBeInTheDocument();
  });

  it("includes the Statement section beneath Hero", () => {
    render(<HomePage />);
    expect(screen.getByText(STATEMENT.body)).toBeInTheDocument();
    expect(screen.getByText(STATEMENT.eyebrow)).toBeInTheDocument();
  });

  it("includes the Services section with all SERVICES rendered", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 2, name: /services/i })).toBeInTheDocument();
    for (const service of SERVICES) {
      expect(
        screen.getByRole("heading", { level: 3, name: new RegExp(service.titleLineOne, "i") }),
      ).toBeInTheDocument();
    }
  });
});
