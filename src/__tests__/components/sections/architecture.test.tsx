import { render, screen } from "@testing-library/react";
import { ArchitecturePatterns } from "@/components/sections/ArchitecturePatterns";

// The section renders two layouts (a desktop grid diagram + a stacked mobile
// layout); CSS media queries pick one. jsdom applies neither, so shared labels
// appear in both — hence getAllBy* below.
describe("ArchitecturePatterns", () => {
  it("tells the three-zone routing story", () => {
    render(<ArchitecturePatterns />);
    expect(screen.getByRole("heading", { name: /how i architect/i })).toBeInTheDocument();
    expect(screen.getAllByText(/public internet/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/client infrastructure · self-hosted/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ai gateway/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/guardrails & security/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/observability & evals/i).length).toBeGreaterThan(0);
  });

  it("shows entry points, protocols, environments and discovery mechanisms", () => {
    render(<ArchitecturePatterns />);
    expect(screen.getAllByText("api.domain.com").length).toBeGreaterThan(0);
    expect(screen.getAllByText("HTTPS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("WSS").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ingress · gateway api · crds/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/via litellm model proxy/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/staging \/ prod/i).length).toBeGreaterThan(0);
  });

  it("uses real platform + tool logos as the backbone", () => {
    render(<ArchitecturePatterns />);
    expect(screen.getAllByRole("img", { name: "Kubernetes" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("img", { name: "Docker" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("img", { name: "NestJS" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("img", { name: "PostgreSQL" }).length).toBeGreaterThan(0);
    // cross-cutting toolchain strip (rendered once)
    expect(screen.getByRole("img", { name: "Grafana" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Pulumi" })).toBeInTheDocument();
  });

  it("renders both a desktop diagram and a stacked mobile layout", () => {
    render(<ArchitecturePatterns />);
    expect(document.querySelector(".arch-scroll")).not.toBeNull();
    expect(document.querySelector(".arch-mobile")).not.toBeNull();
  });

  it("animates on its own — no trace button, travelling pulses on every wire", () => {
    render(<ArchitecturePatterns />);
    expect(screen.queryByRole("button", { name: /trace a request/i })).toBeNull();
    // every desktop connector carries a pulse (3 in + 1 trunk + 3 routing = 7)
    expect(document.querySelectorAll(".wire-pulse").length).toBe(7);
  });
});
