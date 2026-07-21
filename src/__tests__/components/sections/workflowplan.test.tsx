import { render, screen } from "@testing-library/react";
import { WorkflowChart } from "@/components/sections/WorkflowPlan";
import { buildTimeline, type Pull } from "@/lib/github";

const pull = (o: Partial<Pull>): Pull => ({
  number: 1,
  title: "PR",
  state: "merged",
  createdAt: "2026-06-01T00:00:00Z",
  endAt: "2026-06-05T00:00:00Z",
  url: "https://github.com/x/y/pull/1",
  ...o,
});

const timeline = buildTimeline(
  [
    pull({ number: 39, title: "feat(ui): liquid glass nav", state: "merged", createdAt: "2026-06-10T00:00:00Z", endAt: "2026-06-14T00:00:00Z" }),
    pull({ number: 40, title: "feat(architecture): trace a request", state: "open", createdAt: "2026-07-15T00:00:00Z", endAt: "2026-07-20T12:00:00Z" }),
  ],
  new Date("2026-07-20T12:00:00Z").getTime(),
)!;

describe("Live delivery chart (from GitHub pull requests)", () => {
  it("renders a bar per pull request, titled, linking out, coloured by state", () => {
    render(<WorkflowChart timeline={timeline} repo="Mokhatla-Sifiso/the-foundry" url="https://github.com/Mokhatla-Sifiso/the-foundry" pushedAgo="2h ago" />);
    expect(screen.getAllByText("feat(ui): liquid glass nav").length).toBeGreaterThan(0);
    expect(screen.getAllByText("feat(architecture): trace a request").length).toBeGreaterThan(0);
    expect(document.querySelectorAll(".wfp-bar--merged").length).toBeGreaterThan(0);
    expect(document.querySelectorAll(".wfp-bar--open").length).toBeGreaterThan(0);
    const links = screen.getAllByRole("link");
    expect(links.some((a) => a.getAttribute("href")?.includes("/pull/"))).toBe(true);
  });

  it("carries the live badge + Now marker, and none of the dropped dashboard stats", () => {
    render(<WorkflowChart timeline={timeline} repo="Mokhatla-Sifiso/the-foundry" url="https://github.com/x/y" pushedAgo="2h ago" />);
    expect(screen.getAllByText(/live ·/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Now")).toBeInTheDocument();
    // valuable-only: no KPI/stat chrome
    expect(screen.queryByText(/contributors/i)).toBeNull();
    expect(screen.queryByText(/\bstars\b/i)).toBeNull();
    expect(screen.queryByText(/languages/i)).toBeNull();
  });
});
