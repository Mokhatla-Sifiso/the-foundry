jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...rest} />
  ),
}));

import { render, screen } from "@testing-library/react";
import { HeroPortrait } from "@/components/sections/HeroPortrait";
import { SITE } from "@/lib/constants";

describe("HeroPortrait", () => {
  it("renders the gradient placeholder when SITE.portrait is empty", () => {
    expect(SITE.portrait).toBe("");

    render(<HeroPortrait />);

    const placeholder = screen.getByTestId("hero-portrait-placeholder");
    expect(placeholder).toBeInTheDocument();
    expect(placeholder.getAttribute("aria-label")).toMatch(/portrait placeholder/i);
    expect(screen.queryByRole("img", { name: /portrait of/i })).not.toBeInTheDocument();
  });
});
