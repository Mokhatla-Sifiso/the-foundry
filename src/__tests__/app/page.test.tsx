jest.mock("framer-motion");
// WorkflowPlan is an async server component (fetches GitHub) covered by its own
// test; this composition test only checks Hero/Statement/Contact/Footer, so stub it.
jest.mock("@/components/sections/WorkflowPlan", () => ({
  WorkflowPlan: () => <section id="workflow" />,
}));
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
  it("renders the Hero h1 with the spec headline", () => {
    render(<HomePage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(/Turning ideas into\s+digital realities\./i);
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
