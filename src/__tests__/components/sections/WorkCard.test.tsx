import { render, screen } from "@testing-library/react";
import { WorkCard } from "@/components/sections/WorkCard";
import type { Work } from "@/lib/constants";

const BASE: Work = {
  slug: "studiosync",
  title: "StudioSync",
  role: "Acting Technical Lead",
  year: "2025 – present",
  blurb: "Internal creative-ops platform for MTN.",
  href: null,
};

describe("WorkCard", () => {
  it("renders title, role, year, and blurb", () => {
    render(<WorkCard work={BASE} />);

    expect(screen.getByRole("heading", { level: 3, name: BASE.title })).toBeInTheDocument();
    expect(screen.getByText(BASE.role)).toBeInTheDocument();
    expect(screen.getByText(BASE.year)).toBeInTheDocument();
    expect(screen.getByText(BASE.blurb)).toBeInTheDocument();
  });

  it("renders as a non-interactive article when href is null", () => {
    render(<WorkCard work={BASE} />);

    const article = screen.getByRole("article", { name: BASE.title });
    expect(article.tagName).toBe("ARTICLE");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders as an anchor with target=_blank when href is set", () => {
    const linked: Work = { ...BASE, href: "https://example.com" };
    render(<WorkCard work={linked} />);

    const link = screen.getByRole("link", { name: /StudioSync — open in new tab/i });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toMatch(/noopener/);
    expect(link.getAttribute("rel")).toMatch(/noreferrer/);
  });
});
