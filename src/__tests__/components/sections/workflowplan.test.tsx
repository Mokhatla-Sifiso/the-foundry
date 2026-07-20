import { render, screen } from "@testing-library/react";
import { WorkflowPlan } from "@/components/sections/WorkflowPlan";

// Renders a desktop timeline + a stacked mobile list; CSS media queries
// pick one. jsdom applies neither, so shared labels appear twice.
describe("WorkflowPlan", () => {
  it("renders the delivery heading and workflow-plan framing", () => {
    render(<WorkflowPlan />);
    expect(screen.getByRole("heading", { name: /how i deliver/i })).toBeInTheDocument();
    expect(screen.getAllByText(/workflow plan/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/4 months/i).length).toBeGreaterThan(0);
  });

  it("uses the industry-standard enterprise SDLC phases with week durations", () => {
    render(<WorkflowPlan />);
    for (const phase of [
      "Discovery",
      "Requirements Analysis",
      "Architecture & Design",
      "Development",
      "QA & Testing",
      "UAT",
      "Release",
      "Hypercare",
    ]) {
      expect(screen.getAllByText(phase).length).toBeGreaterThan(0);
    }
    // durations are in weeks, not calendar dates
    expect(screen.getAllByText("7 weeks").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1 week").length).toBeGreaterThan(0);
  });

  it("uses a relative week axis — no specific calendar dates", () => {
    render(<WorkflowPlan />);
    expect(screen.getByText("Wk 0")).toBeInTheDocument();
    expect(screen.getByText("Wk 16")).toBeInTheDocument();
    // no month/day calendar labels leak in
    expect(screen.queryByText(/feb|mar|apr|may/i)).toBeNull();
  });

  it("carries the Now marker and delivery milestones", () => {
    render(<WorkflowPlan />);
    expect(screen.getByText("Now")).toBeInTheDocument();
    expect(screen.getByText("Kickoff")).toBeInTheDocument();
    expect(screen.getByText("Build start")).toBeInTheDocument();
    expect(screen.getByText("Go-live")).toBeInTheDocument();
  });

  it("renders both a desktop timeline and a stacked mobile layout", () => {
    render(<WorkflowPlan />);
    expect(document.querySelector(".wfp-scroll")).not.toBeNull();
    expect(document.querySelector(".wfp-mobile")).not.toBeNull();
    expect(document.querySelectorAll(".wfp-bar").length).toBe(8);
  });
});
