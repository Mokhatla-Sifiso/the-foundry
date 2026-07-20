import { act, fireEvent, render, screen } from "@testing-library/react";
import { ArchitecturePatterns } from "@/components/sections/ArchitecturePatterns";

describe("ArchitecturePatterns", () => {
  afterEach(() => jest.useRealTimers());

  it("renders the heading and the centred hub composition", () => {
    render(<ArchitecturePatterns />);
    expect(screen.getByRole("heading", { name: /how i architect/i })).toBeInTheDocument();
    // a single dominant hub, flanked by two nodes
    expect(document.querySelectorAll(".arch-hub").length).toBe(1);
    expect(document.querySelectorAll(".arch-flank").length).toBe(2);
    // six tool chips orbit the hub
    expect(document.querySelectorAll(".arch-orbit-chip").length).toBe(6);
  });

  it("shows real tool logos as the backbone (labelled for a11y)", () => {
    render(<ArchitecturePatterns />);
    expect(screen.getByRole("img", { name: "NestJS" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /PostgreSQL/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ollama" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Next.js" })).toBeInTheDocument();
    // cross-cutting tooling strip
    expect(screen.getByRole("img", { name: "Docker" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Grafana" })).toBeInTheDocument();
  });

  it("goes live when a request is traced, then settles", () => {
    jest.useFakeTimers();
    render(<ArchitecturePatterns />);
    expect(document.querySelector(".arch-diagram.is-live")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /trace a request/i }));
    expect(document.querySelector(".arch-diagram.is-live")).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(2700);
    });
    expect(document.querySelector(".arch-diagram.is-live")).toBeNull();
  });
});
