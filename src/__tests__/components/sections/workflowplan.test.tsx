import { render, screen } from "@testing-library/react";
import { WorkflowPlan } from "@/components/sections/WorkflowPlan";

// Renders a desktop timeline + a stacked mobile list; CSS media queries
// pick one. jsdom applies neither, so shared labels appear twice.
describe("WorkflowPlan", () => {
  it("renders the delivery heading and workflow-plan framing", () => {
    render(<WorkflowPlan />);
    expect(screen.getByRole("heading", { name: /how i deliver/i })).toBeInTheDocument();
    expect(screen.getAllByText(/workflow plan/i).length).toBeGreaterThan(0);
  });

  it("shows the enterprise SDLC phases and the Now / milestone markers", () => {
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
    expect(screen.getByText("Now")).toBeInTheDocument();
    expect(screen.getByText("Kickoff")).toBeInTheDocument();
    expect(screen.getByText("Go-live")).toBeInTheDocument();
    // eight positioned bars on the timeline
    expect(document.querySelectorAll(".wfp-bar").length).toBe(8);
  });

  it("shows no specific times — no durations, week numbers, dates or total", () => {
    render(<WorkflowPlan />);
    expect(screen.queryByText(/\d+\s*weeks?/i)).toBeNull();
    expect(screen.queryByText(/months?/i)).toBeNull();
    expect(screen.queryByText(/\bWk\b/)).toBeNull();
    expect(screen.queryByText(/feb|mar|apr|may/i)).toBeNull();
  });

  it("renders both a desktop timeline and a stacked mobile layout", () => {
    render(<WorkflowPlan />);
    expect(document.querySelector(".wfp-scroll")).not.toBeNull();
    expect(document.querySelector(".wfp-mobile")).not.toBeNull();
  });
});
