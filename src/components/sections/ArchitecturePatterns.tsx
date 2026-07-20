"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/primitives/Reveal";
import { ARCH_LAYERS, ARCH_NODES, type ArchLayer, type ArchNode } from "@/lib/architecture";

type Selection = Readonly<{ kind: "node" | "layer"; id: string }>;

const STEP_MS = 520;
const LAST = ARCH_NODES.length - 1;

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
            A reference architecture for an AI-native product, traced end to end. Fire a request and
            follow it through the path, or open any layer it sits inside.
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

          <div className="arch-flow" aria-label="Request path">
            {ARCH_NODES.map((node, i) => {
              const isActive = selection.kind === "node" && selection.id === node.id;
              const lit = pulse >= i;
              return (
                <button
                  key={node.id}
                  type="button"
                  className={`arch-node${isActive ? " is-active" : ""}${lit ? " is-lit" : ""}${
                    tracing && pulse === i ? " is-pulse" : ""
                  }`}
                  onClick={() => pick({ kind: "node", id: node.id })}
                  aria-pressed={isActive}
                  aria-label={`${node.label}: ${node.role}`}
                >
                  <span className="arch-node-n">{node.n}</span>
                  <span className="arch-node-label">{node.label}</span>
                  <span className="arch-node-role">{node.role}</span>
                </button>
              );
            })}
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
