import { render, screen } from "@testing-library/react";
import { WorkflowPlan } from "@/components/sections/WorkflowPlan";

// Renders a desktop cascade + a stacked mobile list; CSS media queries
// pick one. jsdom applies neither, so shared labels appear twice.
describe("WorkflowPlan", () => {
  it("renders the delivery heading and workflow-plan framing", () => {
    render(<WorkflowPlan />);
    expect(screen.getByRole("heading", { name: /how i deliver/i })).toBeInTheDocument();
    expect(screen.getAllByText(/workflow plan/i).length).toBeGreaterThan(0);
  });

  it("lists the industry-standard enterprise SDLC phases in order", () => {
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
    // numbered sequence
    expect(screen.getAllByText("01").length).toBeGreaterThan(0);
    expect(screen.getAllByText("08").length).toBeGreaterThan(0);
  });

  it("shows no time — no durations, dates, week axis, Now or milestones", () => {
    render(<WorkflowPlan />);
    expect(screen.queryByText(/weeks?/i)).toBeNull();
    expect(screen.queryByText(/months?/i)).toBeNull();
    expect(screen.queryByText(/\bWk\b/)).toBeNull();
    expect(screen.queryByText(/^now$/i)).toBeNull();
    expect(screen.queryByText(/kickoff|go-live|build start/i)).toBeNull();
    expect(screen.queryByText(/feb|mar|apr|may/i)).toBeNull();
  });

  it("renders both a desktop cascade and a stacked mobile layout", () => {
    render(<WorkflowPlan />);
    expect(document.querySelector(".wfp-scroll")).not.toBeNull();
    expect(document.querySelector(".wfp-mobile")).not.toBeNull();
    expect(document.querySelectorAll(".wfp-bar").length).toBe(8);
  });
});
