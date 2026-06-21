jest.mock("framer-motion");
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...rest} />
  ),
}));

import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/sections/Hero";
import { SITE } from "@/lib/constants";

describe("Hero", () => {
  it("renders the wordmark as an accessible h1 with the studio name as aria-label", () => {
    render(<Hero />);

    const heading = screen.getByRole("heading", { level: 1, name: SITE.name });
    expect(heading).toBeInTheDocument();
  });

  it("renders each character of the short name as its own span", () => {
    render(<Hero />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe(SITE.shortName.toUpperCase());

    const letterCount = heading.querySelectorAll("span span").length;
    expect(letterCount).toBe(SITE.shortName.length);
  });

  it("renders the role and tagline meta block", () => {
    render(<Hero />);

    expect(screen.getByText(SITE.role)).toBeInTheDocument();
    expect(screen.getByText(SITE.tagline)).toBeInTheDocument();
  });

  it("includes the portrait slot", () => {
    render(<Hero />);

    expect(screen.getByTestId("hero-portrait-placeholder")).toBeInTheDocument();
  });
});
