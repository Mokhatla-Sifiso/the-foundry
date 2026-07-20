import { render, screen } from "@testing-library/react";
import { LiveTimeline, TemplateTimeline } from "@/components/sections/WorkflowPlan";
import { buildTimeline, type Milestone } from "@/lib/github";

const ms = (o: Partial<Milestone>): Milestone => ({
  number: 1,
  title: "Phase",
  state: "open",
  open: 0,
  closed: 0,
  total: 0,
  progress: 0,
  createdAt: "2026-01-01T00:00:00Z",
  dueOn: null,
  closedAt: null,
  url: "https://github.com/x/y/milestone/1",
  ...o,
});

describe("WorkflowPlan — template fallback (no milestones)", () => {
  it("shows the SDLC phases, Now and milestone markers, no specific times", () => {
    render(<TemplateTimeline />);
    for (const phase of ["Discovery", "Development", "UAT", "Release", "Hypercare"]) {
      expect(screen.getAllByText(phase).length).toBeGreaterThan(0);
    }
    expect(screen.getByText("Now")).toBeInTheDocument();
    expect(screen.getByText("Kickoff")).toBeInTheDocument();
    expect(screen.queryByText(/\d+\s*weeks?/i)).toBeNull();
    expect(screen.queryByText(/\bWk\b/)).toBeNull();
  });
});

describe("WorkflowPlan — live tracker (from GitHub milestones)", () => {
  const timeline = buildTimeline(
    [
      ms({ number: 1, title: "Foundation", state: "closed", open: 0, closed: 4, total: 4, progress: 1, createdAt: "2026-01-01T00:00:00Z", dueOn: "2026-01-20T00:00:00Z" }),
      ms({ number: 2, title: "Auth & access", open: 3, closed: 3, total: 6, progress: 0.5, createdAt: "2026-01-15T00:00:00Z", dueOn: "2026-02-20T00:00:00Z" }),
    ],
    new Date("2026-02-01T00:00:00Z").getTime(),
  )!;

  it("renders a bar per milestone with real progress and a repo link", () => {
    render(<LiveTimeline timeline={timeline} />);
    expect(screen.getAllByText("Foundation").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Auth & access").length).toBeGreaterThan(0);
    // real progress percentages
    expect(screen.getAllByText("100%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("50%").length).toBeGreaterThan(0);
    // the "Live" badge links out to the repo milestones
    expect(screen.getAllByText(/live/i).length).toBeGreaterThan(0);
    const links = screen.getAllByRole("link");
    expect(links.some((a) => a.getAttribute("href")?.includes("/milestone"))).toBe(true);
  });

  it("marks completed milestones as done", () => {
    render(<LiveTimeline timeline={timeline} />);
    expect(document.querySelectorAll(".wfp-live.is-done").length).toBeGreaterThan(0);
  });
});
