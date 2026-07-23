jest.mock("framer-motion");
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...rest} />
  ),
}));
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { AISection } from "@/components/sections/AISection";
import { Faq } from "@/components/sections/Faq";
import { TransContinental } from "@/components/sections/TransContinental";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Recruiters } from "@/components/sections/Recruiters";
import { Services } from "@/components/sections/Services";
import { Statement } from "@/components/sections/Statement";
import { Work } from "@/components/sections/Work";
import { FAQS, NAVLINKS, SERVICES, SITE, WORK, XP } from "@/lib/constants";
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
    expect(screen.getByText("410 tests")).toBeInTheDocument();
  });
  it("quotes one test count, not two: the CI mock and the proof line must agree", () => {
    beforeEachLocal();
    const { container } = render(<AISection />);
    // The number appears twice, hardcoded in two components. If one is bumped
    // and the other is not, the section contradicts itself in public.
    const counts = [...(container.textContent ?? "").matchAll(/(\d{2,5}) tests/g)].map((m) => m[1]);
    expect(counts.length).toBeGreaterThan(1);
    expect(new Set(counts).size).toBe(1);
  });
  it("respects the showPhone / showDesktop toggles", () => {
    beforeEachLocal();
    const { container } = render(<AISection showPhone={false} showDesktop={false} />);
    expect(container.querySelector(".phone")).toBeNull();
    expect(container.querySelector(".tablet")).toBeNull();
    expect(container.querySelector(".watch")).not.toBeNull();
    expect(container.querySelector(".laptop")).not.toBeNull();
  });
  it("adds the peak modifier only while the section spans the viewport centre", () => {
    beforeEachLocal();
    let fire: ((entries: Array<{ isIntersecting: boolean }>) => void) | undefined;
    const observe = jest.fn();
    const disconnect = jest.fn();
    class MockIO {
      constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
        fire = cb;
      }
      observe = observe;
      disconnect = disconnect;
      unobserve = jest.fn();
      takeRecords = jest.fn();
    }
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIO;
    const { container } = render(<AISection />);
    const section = container.querySelector("section#ai") as HTMLElement;
    expect(section.classList.contains("ai--peak")).toBe(false);
    act(() => fire?.([{ isIntersecting: true }]));
    expect(section.classList.contains("ai--peak")).toBe(true);
    act(() => fire?.([{ isIntersecting: false }]));
    expect(section.classList.contains("ai--peak")).toBe(false);
  });
  function beforeEachLocal(): void {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  }
});
describe("TransContinental", () => {
  it("shows the Now showing panel for the first location with day-to-day, core and deliverables", () => {
    render(<TransContinental />);
    expect(screen.getByText("Now showing")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(/Pretoria/);
    expect(screen.getByText("Day to day")).toBeInTheDocument();
    expect(screen.getByText("Core")).toBeInTheDocument();
    expect(screen.getByText("Deliverables")).toBeInTheDocument();
    expect(screen.getByText(/GE Smallworld Magik platform/)).toBeInTheDocument();
  });
  it("switches the panel content when another city is selected", () => {
    render(<TransContinental />);
    fireEvent.click(screen.getByRole("button", { name: "Roodepoort" }));
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(/Roodepoort/);
    expect(screen.getByText("MTN Group")).toBeInTheDocument();
    expect(screen.getByText(/Led StudioSync sprints/)).toBeInTheDocument();
    expect(
      screen.getByText(/Time reporting, people and contract-management modules/),
    ).toBeInTheDocument();
  });
  it("closes the MTN and Accenture stints at Apr 2026 rather than leaving them open", () => {
    render(<TransContinental />);
    for (const city of ["Roodepoort", "Waterfall"]) {
      fireEvent.click(screen.getByRole("button", { name: city }));
      expect(screen.getByText("Mar 2024 to Apr 2026")).toBeInTheDocument();
      expect(screen.queryByText(/present|current/i)).not.toBeInTheDocument();
    }
  });
});
describe("Faq", () => {
  it("renders an accordion: a toggle button per question and the answers present", () => {
    const { container } = render(<Faq />);
    expect(container.querySelector("section#faq")).not.toBeNull();
    for (const item of FAQS) {
      expect(
        screen.getByRole("button", {
          name: new RegExp(item.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        }),
      ).toBeInTheDocument();
      expect(screen.getByText(item.a)).toBeInTheDocument();
    }
    expect(container.querySelectorAll(".faq-item").length).toBe(FAQS.length);
  });
  it("opens the first item by default and toggles on click", () => {
    const { container } = render(<Faq />);
    const items = container.querySelectorAll(".faq-item");
    expect(items[0].classList.contains("faq-item--open")).toBe(true);
    expect(items[1].classList.contains("faq-item--open")).toBe(false);
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(FAQS[1].q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      }),
    );
    expect(container.querySelectorAll(".faq-item")[1].classList.contains("faq-item--open")).toBe(
      true,
    );
    expect(container.querySelectorAll(".faq-item")[0].classList.contains("faq-item--open")).toBe(
      false,
    );
  });
});
describe("Contact", () => {
  it("renders the collaboration section: headline, channels, and the form", () => {
    render(<Contact />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/worth shipping/i);
    expect(screen.getByText(/considered reply/i)).toBeInTheDocument();
    expect(screen.getByText(SITE.email)).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Contract" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send message/i })).toBeInTheDocument();
  });
  it("posts to /api/contact and shows the sent confirmation on success", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<Contact />);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Jane Recruiter" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@acme.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/A sentence on the project/), {
      target: { value: "We need a contractor for a three-month build." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send message/i }));
    expect(await screen.findByText("Message sent.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({ method: "POST" }),
    );
  });
  it("shows a validation message and does not post when fields are empty", () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<Contact />);
    fireEvent.click(screen.getByRole("button", { name: /Send message/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Add your name/i);
    expect(fetchMock).not.toHaveBeenCalled();
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
