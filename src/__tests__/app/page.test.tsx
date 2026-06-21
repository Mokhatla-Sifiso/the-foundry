jest.mock("framer-motion");
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...rest} />
  ),
}));

import { render, screen, within } from "@testing-library/react";
import HomePage from "@/app/page";
import { EXPERIENCE, SERVICES, SITE, STATEMENT, WORK } from "@/lib/constants";

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

  it("includes the Work section with every WORK project title", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 2, name: /selected work/i })).toBeInTheDocument();
    for (const project of WORK) {
      expect(
        screen.getByRole("heading", { level: 3, name: project.title }),
      ).toBeInTheDocument();
    }
  });

  it("includes the Experience section with every EXPERIENCE row's blurb", () => {
    render(<HomePage />);
    // Scope assertions to the Experience section because some role/company
    // strings (e.g. "Co-founder & Engineer", "Oddity") also appear in Work.
    const region = screen.getByRole("region", { name: /experience/i });
    expect(within(region).getByRole("heading", { level: 2, name: /experience/i })).toBeInTheDocument();
    for (const row of EXPERIENCE) {
      expect(within(region).getByText(row.blurb)).toBeInTheDocument();
    }
  });
});
