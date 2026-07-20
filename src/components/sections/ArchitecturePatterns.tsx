"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/primitives/Reveal";
import { ARCH_LAYERS, ARCH_NODES, type ArchLayer, type ArchNode } from "@/lib/architecture";

type Selection = Readonly<{ kind: "node" | "layer"; id: string }>;

const STEP_MS = 480;
const LAST = ARCH_NODES.length - 1;

// Board layout — top-left origin of each node's box.
const NODE_W = 160;
const NODE_H = 76;
const POS: Record<string, { x: number; y: number }> = {
  client: { x: 40, y: 30 },
  edge: { x: 40, y: 150 },
  shell: { x: 40, y: 270 },
  bff: { x: 300, y: 270 },
  gateway: { x: 560, y: 270 },
  ai: { x: 820, y: 240 },
  data: { x: 820, y: 400 },
  workers: { x: 1040, y: 400 },
};

// Routed circuit traces. `into` = the flow index that lights this trace when the
// pulse arrives (client=0 … data=6). The branch to workers lights once AI is live.
type Trace = Readonly<{ id: string; d: string; into: number }>;
const TRACES: ReadonlyArray<Trace> = [
  { id: "t-client-edge", d: "M120 106 V150", into: 1 },
  { id: "t-edge-shell", d: "M120 226 V270", into: 2 },
  { id: "t-shell-bff", d: "M200 308 H300", into: 3 },
  { id: "t-bff-gateway", d: "M460 308 H560", into: 4 },
  { id: "t-gateway-ai", d: "M720 308 H770 V278 H820", into: 5 },
  { id: "t-ai-data", d: "M900 316 V400", into: 6 },
  { id: "t-ai-workers", d: "M980 278 H1010 V438 H1040", into: 5 },
];

export function ArchitecturePatterns(): React.ReactElement {
  const [selection, setSelection] = useState<Selection>({ kind: "node", id: ARCH_NODES[0].id });
  const [pulse, setPulse] = useState(-1);
  const [tracing, setTracing] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback((): void => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const pick = useCallback(
    (sel: Selection): void => {
      clearTimers();
      setTracing(false);
      setSelection(sel);
    },
    [clearTimers],
  );

  const trace = useCallback((): void => {
    clearTimers();
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPulse(LAST);
      setSelection({ kind: "node", id: ARCH_NODES[LAST].id });
      return;
    }
    setTracing(true);
    setPulse(-1);
    ARCH_NODES.forEach((node, i) => {
      const t = window.setTimeout(
        () => {
          setPulse(i);
          setSelection({ kind: "node", id: node.id });
          if (i === LAST) setTracing(false);
        },
        140 + i * STEP_MS,
      );
      timers.current.push(t);
    });
  }, [clearTimers]);

  const activeNode =
    selection.kind === "node" ? ARCH_NODES.find((n) => n.id === selection.id) : undefined;
  const activeLayer =
    selection.kind === "layer" ? ARCH_LAYERS.find((l) => l.id === selection.id) : undefined;

  const flowIndex = (id: string): number => ARCH_NODES.findIndex((n) => n.id === id);

  return (
    <section id="architecture" className="sec arch">
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          Architectures &amp; Patterns
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="arch-h">
            How I architect <span className="em">what I ship.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="arch-lead">
            A reference architecture for an AI-native product, wired end to end. Send a request and
            watch the current run the path, or open any layer it sits inside.
          </p>
        </Reveal>

        <Reveal delay={0.14} className="arch-stage">
          <div className="arch-controls">
            <button
              type="button"
              className="btn btn-primary arch-trace"
              onClick={trace}
              disabled={tracing}
            >
              {tracing ? "Tracing" : "Trace a request"}
            </button>
            <span className="arch-cue" aria-hidden="true">
              someone asks the product a question
            </span>
          </div>

          <div className="arch-board-wrap">
            <svg
              className="arch-board"
              viewBox="0 0 1220 500"
              role="group"
              aria-label="Request path circuit"
            >
              <defs>
                <filter id="arch-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="3.4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <pattern id="arch-grid" width="26" height="26" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" className="arch-grid-dot" />
                </pattern>
              </defs>

              <rect x="0" y="0" width="1220" height="500" fill="url(#arch-grid)" />

              {TRACES.map((t) => {
                const live = pulse >= t.into;
                return (
                  <g key={t.id}>
                    <path d={t.d} className="arch-trace-base" />
                    <path d={t.d} className={`arch-trace-live${live ? " is-on" : ""}`} />
                    {live ? <path d={t.d} className="arch-trace-flow" /> : null}
                  </g>
                );
              })}

              {ARCH_NODES.map((node) => {
                const p = POS[node.id];
                const i = flowIndex(node.id);
                const lit = pulse >= i;
                const isActive = selection.kind === "node" && selection.id === node.id;
                return (
                  <g
                    key={node.id}
                    className={`arch-gnode${lit ? " is-lit" : ""}${isActive ? " is-active" : ""}${
                      tracing && pulse === i ? " is-pulse" : ""
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    aria-label={`${node.label}: ${node.role}`}
                    onClick={() => pick({ kind: "node", id: node.id })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        pick({ kind: "node", id: node.id });
                      }
                    }}
                  >
                    <rect
                      x={p.x}
                      y={p.y}
                      width={NODE_W}
                      height={NODE_H}
                      rx={14}
                      className="arch-gnode-box"
                    />
                    <circle cx={p.x} cy={p.y + NODE_H / 2} r={3} className="arch-pin" />
                    <circle cx={p.x + NODE_W} cy={p.y + NODE_H / 2} r={3} className="arch-pin" />
                    <text x={p.x + 16} y={p.y + 26} className="arch-gnode-n">
                      {node.n}
                    </text>
                    <text x={p.x + 16} y={p.y + 46} className="arch-gnode-label">
                      {node.label}
                    </text>
                    <text x={p.x + 16} y={p.y + 63} className="arch-gnode-role">
                      {node.role}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="arch-layers" aria-label="Cross-cutting layers">
            {ARCH_LAYERS.map((layer) => {
              const isActive = selection.kind === "layer" && selection.id === layer.id;
              return (
                <button
                  key={layer.id}
                  type="button"
                  className={`arch-layer${isActive ? " is-active" : ""}`}
                  onClick={() => pick({ kind: "layer", id: layer.id })}
                  aria-pressed={isActive}
                >
                  <span className="arch-layer-label">{layer.label}</span>
                  <span className="arch-layer-blurb">{layer.blurb}</span>
                </button>
              );
            })}
          </div>

          <div className="arch-panel" aria-live="polite">
            {activeNode ? <NodePanel node={activeNode} /> : null}
            {activeLayer ? <LayerPanel layer={activeLayer} /> : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StackList({ stack }: { stack: ReadonlyArray<string> }): React.ReactElement {
  return (
    <ul className="arch-stack">
      {stack.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}

function NodePanel({ node }: { node: ArchNode }): React.ReactElement {
  return (
    <div className="arch-detail">
      <div className="arch-detail-head">
        <span className="arch-detail-n">{node.n}</span>
        <div>
          <h3 className="arch-detail-title">{node.label}</h3>
          <span className="arch-detail-role">{node.role}</span>
        </div>
      </div>
      <p className="arch-detail-what">{node.what}</p>
      <StackList stack={node.stack} />
      <blockquote className="arch-take">{node.take}</blockquote>
    </div>
  );
}

function LayerPanel({ layer }: { layer: ArchLayer }): React.ReactElement {
  return (
    <div className="arch-detail">
      <div className="arch-detail-head">
        <div>
          <h3 className="arch-detail-title">{layer.label}</h3>
          <span className="arch-detail-role">{layer.blurb}</span>
        </div>
      </div>
      <StackList stack={layer.stack} />
      <blockquote className="arch-take">{layer.take}</blockquote>
    </div>
  );
}
