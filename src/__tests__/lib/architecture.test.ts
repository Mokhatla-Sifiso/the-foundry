import { ARCH_LAYERS, ARCH_NODES } from "@/lib/architecture";

describe("ARCH_NODES", () => {
  it("traces the full request path in order", () => {
    expect(ARCH_NODES.map((n) => n.id)).toEqual([
      "client",
      "edge",
      "shell",
      "bff",
      "gateway",
      "ai",
      "data",
      "workers",
    ]);
  });

  it("numbers the nodes 01..08 in sequence", () => {
    expect(ARCH_NODES.map((n) => n.n)).toEqual(["01", "02", "03", "04", "05", "06", "07", "08"]);
  });

  it("gives every node a label, role, what, a non-empty stack, and a take", () => {
    for (const node of ARCH_NODES) {
      expect(node.label.length).toBeGreaterThan(0);
      expect(node.role.length).toBeGreaterThan(0);
      expect(node.what.length).toBeGreaterThan(0);
      expect(node.stack.length).toBeGreaterThan(0);
      expect(node.take.length).toBeGreaterThan(0);
    }
  });

  it("names the AI orchestration node's real stack (RAG, gateway, local, tracing)", () => {
    const ai = ARCH_NODES.find((n) => n.id === "ai");
    expect(ai?.stack.join(" ")).toMatch(/pgvector/);
    expect(ai?.stack.join(" ")).toMatch(/LiteLLM/);
    expect(ai?.stack.join(" ")).toMatch(/Ollama/);
    expect(ai?.stack.join(" ")).toMatch(/Langfuse/);
  });
});

describe("ARCH_LAYERS", () => {
  it("covers the four cross-cutting layers", () => {
    expect(ARCH_LAYERS.map((l) => l.id)).toEqual(["security", "observability", "delivery", "dr"]);
  });

  it("gives every layer a label, blurb, a non-empty stack, and a take", () => {
    for (const layer of ARCH_LAYERS) {
      expect(layer.label.length).toBeGreaterThan(0);
      expect(layer.blurb.length).toBeGreaterThan(0);
      expect(layer.stack.length).toBeGreaterThan(0);
      expect(layer.take.length).toBeGreaterThan(0);
    }
  });

  it("keeps disaster recovery honest about tested restores", () => {
    const dr = ARCH_LAYERS.find((l) => l.id === "dr");
    expect(dr?.stack.join(" ")).toMatch(/PITR/);
    expect(dr?.stack.join(" ")).toMatch(/restore drills/);
    expect(dr?.take).toMatch(/never restored/i);
  });
});
