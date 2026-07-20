import { render, screen } from "@testing-library/react";
import { WorkflowPlan } from "@/components/sections/WorkflowPlan";

// Renders a desktop timeline + a stacked mobile list; CSS media queries
// pick one. jsdom applies neither, so shared labels appear twice.
describe("WorkflowPlan", () => {
  it("renders the delivery heading and workflow-plan framing", () => {
    render(<WorkflowPlan />);
    expect(screen.getByRole("heading", { name: /how i deliver/i })).toBeInTheDocument();
    expect(screen.getAllByText(/workflow plan/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3\.5 months/i).length).toBeGreaterThan(0);
  });

  it("shows every phase with its duration", () => {
    render(<WorkflowPlan />);
    for (const phase of [
      "Research",
      "Business Analysis",
      "Wireframes, proto",
      "UI design",
      "Development",
      "Sync",
      "WF Testing",
      "Feedback",
    ]) {
      expect(screen.getAllByText(phase).length).toBeGreaterThan(0);
    }
    // duration chips render (e.g. the long Development phase)
    expect(screen.getAllByText("45 days").length).toBeGreaterThan(0);
    expect(screen.getAllByText("4 days").length).toBeGreaterThan(0);
  });

  it("carries the timeline axis, the Now marker and milestones", () => {
    render(<WorkflowPlan />);
    expect(screen.getByText("Feb 15")).toBeInTheDocument();
    expect(screen.getByText("Now")).toBeInTheDocument();
    expect(screen.getByText("Dev Start")).toBeInTheDocument();
    expect(screen.getByText("Ship")).toBeInTheDocument();
  });

  it("renders both a desktop timeline and a stacked mobile layout", () => {
    render(<WorkflowPlan />);
    expect(document.querySelector(".wfp-scroll")).not.toBeNull();
    expect(document.querySelector(".wfp-mobile")).not.toBeNull();
    // eight positioned bars on the desktop timeline
    expect(document.querySelectorAll(".wfp-bar").length).toBe(8);
  });
});
