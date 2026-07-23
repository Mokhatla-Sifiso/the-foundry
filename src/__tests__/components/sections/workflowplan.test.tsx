import { render, screen, within } from "@testing-library/react";
import { WorkflowChart } from "@/components/sections/WorkflowPlan";
import { buildTracker, type Project } from "@/lib/github";

const project: Project = {
  fullName: "Mokhatla-Sifiso/the-foundry",
  url: "https://github.com/Mokhatla-Sifiso/the-foundry",
  pushedAgo: "3h ago",
  shipped: 33,
  inProgress: 5,
  tracker: buildTracker(true, 33, 5),
};

describe("Live delivery tracker", () => {
  it("renders the real product path from Discovery to Iterate, in order", () => {
    render(<WorkflowChart project={project} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(10);
    expect(within(items[0]).getByText("Discovery")).toBeInTheDocument();
    expect(within(items[9]).getByText("Iterate")).toBeInTheDocument();
    for (const name of ["Solution Architecture", "Build", "Deploy", "Monitor"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("surfaces live GitHub signals: repo, shipped, in progress, phases, last update", () => {
    render(<WorkflowChart project={project} />);
    const repo = screen.getByRole("link", { name: /the-foundry/i });
    expect(repo.getAttribute("href")).toContain("github.com/Mokhatla-Sifiso");
    expect(screen.getByText("33")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("8/10")).toBeInTheDocument();
    expect(screen.getByText(/updated 3h ago/i)).toBeInTheDocument();
  });

  it("shows the tracking axis and Now marker, and per-phase status", () => {
    const { container } = render(<WorkflowChart project={project} />);
    expect(container.querySelectorAll(".wfp-grid").length).toBeGreaterThan(0);
    expect(container.querySelector(".wfp-now-line")).not.toBeNull();
    expect(screen.getByText("Now")).toBeInTheDocument();
    expect(container.querySelectorAll(".wfp-bar--complete").length).toBe(8);
    expect(container.querySelectorAll(".wfp-bar--active").length).toBe(2);
    expect(screen.getAllByText("Shipped").length).toBe(8);
  });

  it("is a single chart — no separate mobile list, no invented percentages", () => {
    render(<WorkflowChart project={project} />);
    expect(document.querySelector(".wfp-mobile")).toBeNull();
    expect(screen.queryByText(/%/)).toBeNull();
  });
});
