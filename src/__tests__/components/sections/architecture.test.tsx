import { act, fireEvent, render, screen } from "@testing-library/react";
import { ArchitecturePatterns } from "@/components/sections/ArchitecturePatterns";

describe("ArchitecturePatterns", () => {
  afterEach(() => jest.useRealTimers());

  it("renders the heading and the tool nodes as a wired flow", () => {
    render(<ArchitecturePatterns />);
    expect(screen.getByRole("heading", { name: /how i architect/i })).toBeInTheDocument();
    // eight tool cards
    expect(document.querySelectorAll(".arch-card").length).toBe(8);
  });

  it("shows real tool logos as the backbone (labelled for a11y)", () => {
    render(<ArchitecturePatterns />);
    expect(screen.getByRole("img", { name: "NestJS" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /PostgreSQL/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ollama" })).toBeInTheDocument();
    // cross-cutting tooling strip
    expect(screen.getByRole("img", { name: "Docker" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Grafana" })).toBeInTheDocument();
  });

  it("lights the tools in sequence when a request is traced", () => {
    jest.useFakeTimers();
    render(<ArchitecturePatterns />);
    fireEvent.click(screen.getByRole("button", { name: /trace a request/i }));

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(document.querySelectorAll(".arch-card.is-lit").length).toBeGreaterThan(0);

    act(() => {
      jest.advanceTimersByTime(8 * 420 + 200);
    });
    expect(document.querySelectorAll(".arch-card.is-lit").length).toBe(8);
    expect(document.querySelectorAll(".arch-link.is-live").length).toBe(7);
  });
});
