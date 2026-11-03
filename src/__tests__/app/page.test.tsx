jest.mock("framer-motion");
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...rest} />
  ),
}));
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";
import { SITE } from "@/lib/constants";
describe("HomePage composition", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });
  it("renders the under-construction Hero h1 with the real code wall under the curl", () => {
    const { container } = render(<HomePage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(/Work in progress\.\s+Peel back the page\./i);
    expect(container.querySelector(".hero-peel .code-wall .tk-keyword")).not.toBeNull();
  });
  it("renders the Statement, Contact, and Footer signatures", () => {
    render(<HomePage />);
    expect(screen.getByText(/I'm a full-stack engineer/)).toBeInTheDocument();
    expect(screen.getByText(/worth shipping/i)).toBeInTheDocument();
    expect(screen.getByText(/Software Engineer · Full-Stack · Tech Lead/)).toHaveTextContent(
      SITE.location,
    );
  });
});
