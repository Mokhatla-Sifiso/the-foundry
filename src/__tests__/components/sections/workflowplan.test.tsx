import { render, screen } from "@testing-library/react";
import { Dashboard } from "@/components/sections/WorkflowPlan";
import type { Project } from "@/lib/github";

const project: Project = {
  repo: {
    fullName: "Mokhatla-Sifiso/the-foundry",
    description: "Personal portfolio, built in the open.",
    stars: 3,
    forks: 1,
    language: "TypeScript",
    pushedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    url: "https://github.com/Mokhatla-Sifiso/the-foundry",
    defaultBranch: "main",
  },
  pulls: [
    { number: 40, title: "feat: live project tracker", state: "open", author: "muzi", url: "https://github.com/x/y/pull/40", at: new Date().toISOString() },
    { number: 39, title: "feat: liquid glass nav", state: "merged", author: "muzi", url: "https://github.com/x/y/pull/39", at: new Date().toISOString() },
  ],
  openPulls: 3,
  mergedPulls: 12,
  languages: [
    { name: "TypeScript", pct: 82 },
    { name: "CSS", pct: 15 },
    { name: "JavaScript", pct: 3 },
  ],
  contributors: [{ login: "Mokhatla-Sifiso", contributions: 120, url: "https://github.com/Mokhatla-Sifiso" }],
};

describe("Live project dashboard", () => {
  it("renders the repo header with a live badge linking to GitHub", () => {
    render(<Dashboard project={project} />);
    expect(screen.getByText("Mokhatla-Sifiso/the-foundry")).toBeInTheDocument();
    expect(screen.getByText(/live · pushed/i)).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links.some((a) => a.getAttribute("href")?.includes("github.com/Mokhatla-Sifiso"))).toBe(true);
  });

  it("shows real KPIs from the project data", () => {
    render(<Dashboard project={project} />);
    expect(screen.getByText("Pull requests")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument(); // 3 open + 12 merged
    expect(screen.getByText(/3 open · 12 merged/)).toBeInTheDocument();
    expect(screen.getAllByText("Contributors").length).toBeGreaterThan(0);
  });

  it("lists recent pull requests with state badges", () => {
    render(<Dashboard project={project} />);
    expect(screen.getByText("feat: live project tracker")).toBeInTheDocument();
    expect(screen.getByText("feat: liquid glass nav")).toBeInTheDocument();
    expect(screen.getByText("Merged")).toBeInTheDocument();
    expect(screen.getByText("Opened")).toBeInTheDocument();
  });

  it("shows a language breakdown and contributors", () => {
    render(<Dashboard project={project} />);
    expect(document.querySelector(".lp-langbar")).not.toBeNull();
    expect(screen.getAllByText(/TypeScript/).length).toBeGreaterThan(0);
    expect(screen.getByText("82%")).toBeInTheDocument();
    // contributor login (distinct from the "…/the-foundry" repo header)
    expect(screen.getByText("Mokhatla-Sifiso")).toBeInTheDocument();
  });
});
