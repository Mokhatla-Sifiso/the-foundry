import { render, screen, within } from "@testing-library/react";
import { WorkflowPlan } from "@/components/sections/WorkflowPlan";

describe("Delivery phases chart", () => {
  it("renders the full product path from Discovery to Iterate, in order", () => {
    render(<WorkflowPlan />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(10);
    expect(within(items[0]).getByText("Discovery")).toBeInTheDocument();
    expect(within(items[9]).getByText("Iterate")).toBeInTheDocument();
    for (const name of ["Solution Architecture", "Build", "Test", "Deploy", "Monitor"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("shows a concrete deliverable for each phase, not filler", () => {
    const { container } = render(<WorkflowPlan />);
    expect(container.querySelectorAll(".wfp-bar-desc")).toHaveLength(10);
    expect(screen.getByText(/system context, runtime design/i)).toBeInTheDocument();
    expect(screen.getByText(/ci\/cd pipeline, environments/i)).toBeInTheDocument();
  });

  it("is a single chart with no live badge and no invented progress", () => {
    const { container } = render(<WorkflowPlan />);
    expect(container.querySelector(".wfp-live-badge")).toBeNull();
    expect(container.querySelector(".wfp-fill")).toBeNull();
    expect(container.querySelector(".wfp-mobile")).toBeNull();
    expect(screen.queryByText(/live ·/i)).toBeNull();
    expect(screen.queryByText(/%/)).toBeNull();
  });
});
