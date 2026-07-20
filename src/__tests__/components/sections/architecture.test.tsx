import { fireEvent, render, screen } from "@testing-library/react";
import { ArchitecturePatterns } from "@/components/sections/ArchitecturePatterns";

describe("ArchitecturePatterns", () => {
  it("tells the three-zone routing story", () => {
    render(<ArchitecturePatterns />);
    expect(screen.getByRole("heading", { name: /how i architect/i })).toBeInTheDocument();
    // zone labels carry the narrative
    expect(screen.getByText(/from the client/i)).toBeInTheDocument();
    expect(screen.getByText(/to your infrastructure/i)).toBeInTheDocument();
    // the gateway hero
    expect(screen.getByText(/ai gateway/i)).toBeInTheDocument();
    // capability pillars framing the engine
    expect(screen.getByText(/guardrails & security/i)).toBeInTheDocument();
    expect(screen.getByText(/observability & evals/i)).toBeInTheDocument();
  });

  it("shows entry points, protocols and discovery mechanisms", () => {
    render(<ArchitecturePatterns />);
    expect(screen.getByText("api.domain.com")).toBeInTheDocument();
    expect(screen.getByText("HTTPS")).toBeInTheDocument();
    expect(screen.getByText("WSS")).toBeInTheDocument();
    // per-platform discovery tags — the production-grade detail
    expect(screen.getByText(/ingress · gateway api · crds/i)).toBeInTheDocument();
    expect(screen.getByText(/labels & tags/i)).toBeInTheDocument();
  });

  it("uses real platform + tool logos as the backbone", () => {
    render(<ArchitecturePatterns />);
    expect(screen.getAllByRole("img", { name: "Kubernetes" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("img", { name: "Docker" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("img", { name: "NestJS" })).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "Ollama" }).length).toBeGreaterThan(0);
    // cross-cutting toolchain strip
    expect(screen.getByRole("img", { name: "Grafana" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Pulumi" })).toBeInTheDocument();
  });

  it("goes live when a request is traced", () => {
    render(<ArchitecturePatterns />);
    expect(document.querySelector(".arch-stage.is-live")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /trace a request/i }));
    expect(document.querySelector(".arch-stage.is-live")).not.toBeNull();
  });
});
