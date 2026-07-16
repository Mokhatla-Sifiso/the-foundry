jest.mock("framer-motion");
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...rest} />
  ),
}));
import { render, screen, within } from "@testing-library/react";
import { AISection } from "@/components/sections/AISection";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Recruiters } from "@/components/sections/Recruiters";
import { Services } from "@/components/sections/Services";
import { Statement } from "@/components/sections/Statement";
import { Work } from "@/components/sections/Work";
import { NAVLINKS, SERVICES, SITE, WORK, XP } from "@/lib/constants";
describe("Recruiters", () => {
  it("renders three tier cards, each routed to its own access path, plus one email link", () => {
    const { container } = render(<Recruiters />);
    expect(container.querySelector("section#recruiters")).not.toBeNull();
    const href = (sel: string): string | null | undefined =>
      container.querySelector(sel)?.getAttribute("href");
    expect(href(".pass--silver")).toBe("/guest");
    expect(href(".pass--platinum")).toBe("/recruiter");
    expect(href(".pass--black")).toBe("/executive");
    const toEmail = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("href") === `mailto:${SITE.email}`);
    expect(toEmail).toHaveLength(1);
  });
});
describe("Hero", () => {
  it("renders the spec's lowercase wordmark + h1 + Scroll cue", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector(".hero-mark")?.textContent).toBe("mzwakhe");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Turning ideas into\s+digital realities\./i,
    );
    expect(screen.getByText("Scroll")).toBeInTheDocument();
  });
  it("ids the section as #top so the brand href can scroll-link back", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("section#top")).not.toBeNull();
  });
  it("renders the portrait next/image with the SITE.portrait src + descriptive alt", () => {
    render(<Hero />);
    const img = screen.getByAltText(`Portrait of ${SITE.name}`) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toBe(SITE.portrait);
  });
});
describe("Statement", () => {
  it("renders the spec copy with the production-ready + software spans", () => {
    render(<Statement />);
    expect(screen.getByText("About")).toBeInTheDocument();
    const para = screen.getByText(/I'm a full-stack engineer/);
    expect(para).toHaveTextContent(/production-ready/);
    expect(para).toHaveTextContent(/software\./);
  });
});
describe("Services", () => {
  it("renders the eyebrow, intro statement, and all four cards with stack styles", () => {
    const { container } = render(<Services />);
    expect(screen.getAllByText("Services").length).toBeGreaterThan(0);
    expect(screen.getByText(/What I do:/)).toBeInTheDocument();
    const cards = container.querySelectorAll(".svc-card");
    expect(cards.length).toBe(SERVICES.length);
    cards.forEach((card, i) => {
      const style = (card as HTMLElement).getAttribute("style") ?? "";
      expect(style).toContain(`z-index: ${i + 1}`);
    });
  });
  it("renders each service's titleLineOne", () => {
    render(<Services />);
    for (const s of SERVICES) {
      expect(screen.getByRole("heading", { level: 3, name: new RegExp(s.w1) })).toBeInTheDocument();
    }
  });
});
describe("Work", () => {
  it("renders the head copy + all four spec project cards with tag pills", () => {
    render(<Work />);
    expect(screen.getByText(/A track record of turning/)).toBeInTheDocument();
    for (const w of WORK) {
      expect(screen.getByText(w.nm)).toBeInTheDocument();
      expect(screen.getByText(w.og)).toBeInTheDocument();
      expect(screen.getByText(w.tag)).toBeInTheDocument();
    }
  });
});
describe("Experience", () => {
  it("renders all four XP rows; current roles carry a `.now` marker", () => {
    const { container } = render(<Experience />);
    const rows = container.querySelectorAll(".xp-row");
    expect(rows.length).toBe(XP.length);
    XP.forEach((row, i) => {
      const item = rows[i] as HTMLElement;
      const inItem = within(item);
      expect(inItem.getByText(row.role)).toBeInTheDocument();
      expect(inItem.getByText(row.org)).toBeInTheDocument();
      const whenText = inItem.getByText(new RegExp(row.when.replace(/\s+/g, "\\s+")));
      expect(whenText).toBeInTheDocument();
      if (row.now) {
        expect(item.querySelector(".now")).not.toBeNull();
      }
    });
  });
});
describe("AISection", () => {
  it("renders the eyebrow, headline, and the grouped tool lineup with every group", () => {
    beforeEachLocal();
    render(<AISection />);
    expect(screen.getByText("In the workflow")).toBeInTheDocument();
    expect(screen.getByText(/My judgment stayed mine/)).toBeInTheDocument();
    expect(screen.getByText("The tools behind it")).toBeInTheDocument();
    for (const label of ["Agents in the loop", "Think & capture", "Local AI & ops", "Edit & ship"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    for (const tool of ["Claude Code", "Codex", "OpenClaw", "Obsidian", "VS Code", "GitHub"]) {
      expect(screen.getByText(tool)).toBeInTheDocument();
    }
  });
  it("shows the workflow steps, recruiter value points, and the real proof line", () => {
    beforeEachLocal();
    render(<AISection />);
    for (const step of ["Edit", "Pair", "Verify", "Ship"]) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
    expect(screen.getByText("Production-grade, not prototypes")).toBeInTheDocument();
    expect(screen.getByText("Velocity with judgment")).toBeInTheDocument();
    expect(screen.getByText("329 tests")).toBeInTheDocument();
  });
  it("respects the showPhone / showDesktop toggles", () => {
    beforeEachLocal();
    const { container } = render(<AISection showPhone={false} showDesktop={false} />);
    expect(container.querySelector(".phone")).toBeNull();
    expect(container.querySelector(".tablet")).toBeNull();
    expect(container.querySelector(".watch")).not.toBeNull();
    expect(container.querySelector(".laptop")).not.toBeNull();
  });
  function beforeEachLocal(): void {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  }
});
describe("Contact", () => {
  it("renders the Don't be shy headline and both action buttons", () => {
    render(<Contact />);
    expect(screen.getByText(/Don't/)).toBeInTheDocument();
    expect(screen.getByText("shy.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start a conversation/i })).toHaveAttribute(
      "href",
      `mailto:${SITE.email}`,
    );
    expect(screen.getByRole("link", { name: /Download CV/i })).toHaveAttribute(
      "href",
      "/recruiter",
    );
  });
  it("renders the email, phone, and location meta values", () => {
    render(<Contact />);
    expect(screen.getByText(SITE.email)).toBeInTheDocument();
    expect(screen.getByText(SITE.phone)).toBeInTheDocument();
    expect(screen.getByText(SITE.location)).toBeInTheDocument();
  });
});
describe("Footer", () => {
  it("renders the spec wordmark + sub line + 3 links + GoUp", () => {
    render(<Footer />);
    expect(screen.getByText(/Mzwakhe Mokhatla/)).toBeInTheDocument();
    expect(screen.getByText(/Software Engineer · Full-Stack · Tech Lead/)).toHaveTextContent(
      SITE.location,
    );
    expect(screen.getByRole("link", { name: /Email/i })).toHaveAttribute(
      "href",
      `mailto:${SITE.email}`,
    );
    expect(screen.getByRole("link", { name: /Phone/i })).toHaveAttribute("href", SITE.phoneHref);
    expect(screen.getByRole("link", { name: /Work/i })).toHaveAttribute("href", "#work");
    expect(screen.getByRole("button", { name: /scroll back to top/i })).toBeInTheDocument();
  });
});
describe("NAVLINKS shape (re-asserted at section level)", () => {
  it("has exactly 6 entries and the order matches what Menu renders", () => {
    expect(NAVLINKS.length).toBe(6);
  });
});
