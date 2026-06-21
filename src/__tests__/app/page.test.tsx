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
import { SITE } from "@/lib/constants";

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
});
