/**
 * Content model for the Architectures & Patterns showpiece.
 *
 * Framed as "how I architect" — a reference architecture for an AI-native
 * product, not any client's system. The patterns are industry-standard and the
 * takes are personal opinion, so nothing here is confidential.
 */

export type ArchNode = Readonly<{
  id: string;
  n: string;
  label: string;
  role: string;
  what: string;
  stack: ReadonlyArray<string>;
  take: string;
}>;

/** The request path a traced pulse travels: "someone asks the product a question." */
export const ARCH_NODES: ReadonlyArray<ArchNode> = [
  {
    id: "client",
    n: "01",
    label: "Client",
    role: "Interface",
    what: "The screen they type into. The answer streams back word by word.",
    stack: [
      "Next.js 14 · App Router",
      "TanStack Query",
      "Zustand",
      "Tailwind · shadcn/ui",
      "SSE streaming",
    ],
    take: "The only part anyone sees, so everything else exists to make it feel instant. The answer starts rendering the moment the first token lands, not when the last one does.",
  },
  {
    id: "edge",
    n: "02",
    label: "Edge",
    role: "Front door",
    what: "Security, routing, and static assets — served from close to the user.",
    stack: ["Azure Front Door", "WAF", "DDoS Protection", "CDN", "TLS 1.3"],
    take: "The edge is the cheapest place to say no — bad traffic and auth failures should die here, never reaching a service. Distance is latency, so you serve people from near them.",
  },
  {
    id: "shell",
    n: "03",
    label: "App shell",
    role: "Composition",
    what: "Loads the AI feature into the running app at runtime.",
    stack: ["Module Federation 2.0", "Next.js host + remotes"],
    take: "Micro-frontends are an org tool, not a technical one. They earn their keep when separate teams must ship on their own cadence — otherwise they are just moving parts. What makes them work is a one-page contract: shared React version, design tokens, and who rolls back when a remote breaks.",
  },
  {
    id: "bff",
    n: "04",
    label: "BFF",
    role: "Backend-for-frontend",
    what: "Turns a dozen backend calls into one screen-shaped response and streams it back.",
    stack: ["NestJS v10 · Fastify", "Zod", "class-validator", "OpenAPI-first"],
    take: "One layer that gives the screen exactly the shape it needs and keeps secrets server-side, where the browser can never see them. It streams tokens the instant they exist — making you wait for the whole answer is a choice, and it is the wrong one.",
  },
  {
    id: "gateway",
    n: "05",
    label: "API gateway",
    role: "Gateway",
    what: "Checks who you are and how often you can ask, before anything reaches a service.",
    stack: ["Azure API Management", "Entra ID · OAuth2/OIDC", "JWT", "rate limiting"],
    take: "Global concerns live here so no service reinvents them. Gateway for what every request needs, BFF for what the screen needs — layers, not rivals.",
  },
  {
    id: "ai",
    n: "06",
    label: "AI orchestration",
    role: "Retrieval + generation",
    what: "Finds the right context, then asks the model through a gateway that can route to cloud or local.",
    stack: [
      "NestJS",
      "RAG · pgvector",
      "LiteLLM proxy",
      "Ollama · local models",
      "Langfuse",
      "prompt-injection guardrails",
    ],
    take: "The model is the least interesting part. Most of a good AI product is retrieval — the right context beats a bigger model. And product code never calls a provider directly: everything goes through one gateway, so switching models, or dropping to a local one for sensitive data, is a config change, not a rewrite.",
  },
  {
    id: "data",
    n: "07",
    label: "Data",
    role: "State + memory",
    what: "App data and the AI's memory (embeddings) in one relational store.",
    stack: ["PostgreSQL 16 · pgvector", "Prisma v5", "Redis 7 · cache", "MongoDB 7 · documents"],
    take: "The AI's memory lives in the same Postgres as everything else via pgvector — one database you trust beats two you are babysitting, until scale genuinely forces the split. Purity you cannot staff is just risk.",
  },
  {
    id: "workers",
    n: "08",
    label: "Workers",
    role: "Async",
    what: "Slow and scheduled work — embedding new documents, running evals — off the request path.",
    stack: ["BullMQ v5 · Redis", "Azure Functions · queue/timer"],
    take: "The request path should never do work the user is not waiting for. New documents get embedded and indexed in the background; the query is never blocked on ingestion.",
  },
] as const;

export type ArchLayer = Readonly<{
  id: string;
  label: string;
  blurb: string;
  stack: ReadonlyArray<string>;
  take: string;
}>;

/** The cross-cutting layers the whole path sits inside. */
export const ARCH_LAYERS: ReadonlyArray<ArchLayer> = [
  {
    id: "security",
    label: "Security",
    blurb: "Every layer, hardened.",
    stack: [
      "Front Door WAF + DDoS",
      "Entra ID · OAuth2/OIDC",
      "Key Vault + SOPS",
      "private endpoints · VNet",
      "TDE + TLS 1.3",
      "Zod validation",
      "OWASP LLM Top 10 guardrails",
      "PII redaction",
    ],
    take: "Security is not a node, it is a property of every node. Secrets never touch a repo — Key Vault and SOPS, never a raw .env. And an AI product has a new attack surface: prompt injection is the new SQL injection, so untrusted input never reaches the model unfiltered.",
  },
  {
    id: "observability",
    label: "Observability",
    blurb: "If you can't see it, you can't run it.",
    stack: [
      "OpenTelemetry",
      "Prometheus + Grafana",
      "Loki · logs",
      "Jaeger · traces",
      "Langfuse · LLM",
      "SLOs + error budgets",
      "synthetic checks",
    ],
    take: "One instrumentation — OpenTelemetry — feeding metrics, logs, and traces into one place. Every model call is traced down to cost and quality, because the AI feeling worse today should be a dashboard, not a hunch.",
  },
  {
    id: "delivery",
    label: "DevOps & delivery",
    blurb: "Shipping should be boring.",
    stack: [
      "Pulumi · TypeScript IaC",
      "Docker → k3d → k3s",
      "GitHub Actions",
      "blue-green / canary",
      "GitOps",
      "SBOM + image signing",
    ],
    take: "The whole diagram is a TypeScript program, so a mistake is a compile error, not a 2am incident. Every merge is a candidate for production; the pipeline decides it is safe, not a person, and it ships in small, reversible steps.",
  },
  {
    id: "dr",
    label: "Disaster recovery",
    blurb: "Assume it will break.",
    stack: [
      "PostgreSQL PITR",
      "cross-region replicas",
      "multi-region failover",
      "stated RTO / RPO",
      "restore drills",
      "chaos testing",
      "runbooks",
    ],
    take: "A backup you have never restored is a rumour. DR is designed for, with real RTO/RPO targets, tested restores, and fault injection — because the question is not whether a region has a bad day, it is whether your users notice.",
  },
] as const;
