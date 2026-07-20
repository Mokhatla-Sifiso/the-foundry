import { render, screen } from "@testing-library/react";
import { ArchitecturePatterns } from "@/components/sections/ArchitecturePatterns";

describe("ArchitecturePatterns", () => {
  it("tells the three-zone routing story", () => {
    render(<ArchitecturePatterns />);
    expect(screen.getByRole("heading", { name: /how i architect/i })).toBeInTheDocument();
    // zone labels + trust boundary carry the narrative
    expect(screen.getByText(/public internet/i)).toBeInTheDocument();
    expect(screen.getByText(/to your infrastructure/i)).toBeInTheDocument();
    expect(screen.getByText(/client infrastructure · self-hosted/i)).toBeInTheDocument();
    // the gateway hero
    expect(screen.getByText(/ai gateway/i)).toBeInTheDocument();
    // capability pillars framing the engine
    expect(screen.getByText(/guardrails & security/i)).toBeInTheDocument();
    expect(screen.getByText(/observability & evals/i)).toBeInTheDocument();
  });

  it("shows entry points, protocols, environments and discovery mechanisms", () => {
    render(<ArchitecturePatterns />);
    expect(screen.getByText("api.domain.com")).toBeInTheDocument();
    expect(screen.getByText("HTTPS")).toBeInTheDocument();
    expect(screen.getByText("WSS")).toBeInTheDocument();
    // per-platform discovery + environment — the production-grade detail
    expect(screen.getByText(/ingress · gateway api · crds/i)).toBeInTheDocument();
    expect(screen.getByText(/via litellm model proxy/i)).toBeInTheDocument();
    expect(screen.getByText(/staging \/ prod/i)).toBeInTheDocument();
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

  it("animates on its own — no trace button, travelling pulses on every wire", () => {
    render(<ArchitecturePatterns />);
    expect(screen.queryByRole("button", { name: /trace a request/i })).toBeNull();
    // every connector carries a pulse (3 in + 1 trunk + 3 routing = 7)
    expect(document.querySelectorAll(".wire-pulse").length).toBe(7);
  });
});
