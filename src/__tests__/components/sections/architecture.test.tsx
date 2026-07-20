import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { ArchitecturePatterns } from "@/components/sections/ArchitecturePatterns";

describe("ArchitecturePatterns", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the section heading and the first node's detail by default", () => {
    render(<ArchitecturePatterns />);
    expect(screen.getByRole("heading", { name: /how i architect/i })).toBeInTheDocument();
    const panel = document.querySelector(".arch-panel") as HTMLElement;
    // defaults to the first node, "Client"
    expect(within(panel).getByRole("heading", { name: "Client" })).toBeInTheDocument();
  });

  it("swaps the panel to a node when its chip is clicked", () => {
    render(<ArchitecturePatterns />);
    fireEvent.click(screen.getByRole("button", { name: /AI orchestration/i }));
    const panel = document.querySelector(".arch-panel") as HTMLElement;
    expect(within(panel).getByRole("heading", { name: "AI orchestration" })).toBeInTheDocument();
    expect(within(panel).getByText(/pgvector/)).toBeInTheDocument();
  });

  it("shows a cross-cutting layer's detail when its tile is clicked", () => {
    render(<ArchitecturePatterns />);
    fireEvent.click(screen.getByRole("button", { name: /Disaster recovery/i }));
    const panel = document.querySelector(".arch-panel") as HTMLElement;
    expect(within(panel).getByText(/PITR/)).toBeInTheDocument();
    expect(within(panel).getByText(/never restored/i)).toBeInTheDocument();
  });

  it("lights the path in sequence while tracing, ending on the last node", () => {
    jest.useFakeTimers();
    render(<ArchitecturePatterns />);
    fireEvent.click(screen.getByRole("button", { name: /trace a request/i }));

    // partway through, an early node is lit
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(document.querySelectorAll(".arch-node.is-lit").length).toBeGreaterThan(0);

    // after the full sequence, every node is lit and the panel rests on "Workers"
    act(() => {
      jest.advanceTimersByTime(8 * 520 + 200);
    });
    expect(document.querySelectorAll(".arch-node.is-lit").length).toBe(8);
    const panel = document.querySelector(".arch-panel") as HTMLElement;
    expect(within(panel).getByRole("heading", { name: "Workers" })).toBeInTheDocument();
  });
});
