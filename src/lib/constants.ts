export const SITE = {
  name: "Mzwakhe Mokhatla",
  shortName: "Mzwakhe",
  role: "Software Engineer & Co-founder",
  tagline: "Microfrontend specialist building AI-centric products.",
  email: "mokhatla.mzwakhe@gmail.com",
  location: "Johannesburg, South Africa",
  portrait: "",
} as const;

export const STATEMENT = {
  eyebrow: "Studio note",
  body: "I help teams ship microfrontend platforms and AI-centric products. The work is code-first: readable, scalable, quietly correct: so the surface area your team has to think about stays small while what it ships gets larger.",
} as const;

export type NavLink = Readonly<{
  label: string;
  href: string;
}>;

export const NAVLINKS: ReadonlyArray<NavLink> = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Experience", href: "#experience" },
  { label: "AI", href: "#ai" },
  { label: "Contact", href: "#contact" },
  { label: "Recruiter access", href: "/recruiter" },
] as const;

export type Service = Readonly<{
  titleLineOne: string;
  titleLineTwo: string;
  body: string;
  capabilities: ReadonlyArray<string>;
}>;

export const SERVICES: ReadonlyArray<Service> = [
  {
    titleLineOne: "Microfrontend",
    titleLineTwo: "Architecture",
    body: "Federated module boundaries that let independent teams ship without stepping on each other. I've led the pattern across enterprise React surfaces serving millions of users.",
    capabilities: [
      "Module federation rollout",
      "Cross-team contract design",
      "Versioned shared shells",
      "Observability per remote",
    ],
  },
  {
    titleLineOne: "AI-Centric",
    titleLineTwo: "Product Engineering",
    body: "Production LLM workflows behind real product surfaces: proxied calls, traced runs, evaluated outputs. Local models for the sensitive bits, hosted models for the rest.",
    capabilities: [
      "LiteLLM proxy + routing",
      "Langfuse traces & evals",
      "Agentic tool design",
      "Offline-capable fallbacks",
    ],
  },
  {
    titleLineOne: "Full-Stack",
    titleLineTwo: "Build & Ship",
    body: "Next.js App Router on the frontend, NestJS or Django on the backend, Prisma + Postgres for state. Pulumi for infra, GitHub Actions for the pipeline.",
    capabilities: [
      "Next.js 16 App Router",
      "NestJS + Prisma APIs",
      "Pulumi IaC",
      "OpenTelemetry tracing",
    ],
  },
] as const;

export type Work = Readonly<{
  slug: string;
  title: string;
  role: string;
  year: string;
  blurb: string;
  href: string | null;
}>;

export const WORK: ReadonlyArray<Work> = [
  {
    slug: "studiosync",
    title: "StudioSync",
    role: "Acting Technical Lead",
    year: "2025 – present",
    blurb:
      "Internal creative-ops platform for MTN. Microfrontend shell with federated remotes per business unit.",
    href: null,
  },
  {
    slug: "bayobab",
    title: "Bayobab",
    role: "Software Product Engineer",
    year: "2024 – present",
    blurb:
      "Wholesale connectivity portal. Owns the carrier-facing React surface and the BFF that talks to legacy ESBs.",
    href: null,
  },
  {
    slug: "oddity",
    title: "Oddity",
    role: "Co-founder & Engineer",
    year: "2025 – present",
    blurb:
      "AI-centric studio building client products on top of a private LiteLLM + Langfuse stack.",
    href: null,
  },
] as const;

export type ExperienceRow = Readonly<{
  period: string;
  company: string;
  role: string;
  blurb: string;
}>;

export const EXPERIENCE: ReadonlyArray<ExperienceRow> = [
  {
    period: "2025 – present",
    company: "MTN Group",
    role: "Acting Technical Lead: StudioSync",
    blurb:
      "Owns the microfrontend platform's architecture and release cadence. Coaches three squads on contract-driven remote development.",
  },
  {
    period: "2024 – present",
    company: "Accenture",
    role: "Software Product Engineer: Bayobab",
    blurb:
      "Builds the React + BFF stack behind MTN's wholesale carrier portal. Federated remotes, OpenAPI-first contracts.",
  },
  {
    period: "2025 – present",
    company: "Oddity",
    role: "Co-founder & Engineer",
    blurb:
      "Co-leading product direction with Malete (architecture). Implements the build-and-ship side of every engagement.",
  },
] as const;

export type AiItem = Readonly<{
  device: "laptop" | "phone" | "watch" | "tablet";
  label: string;
  detail: string;
}>;

export const AI_ITEMS: ReadonlyArray<AiItem> = [
  {
    device: "laptop",
    label: "Cost dashboard",
    detail: "Per-model spend across LiteLLM, by tenant, by prompt class.",
  },
  {
    device: "phone",
    label: "PR review bot",
    detail: "Inline review comments from an agent with repo-aware context.",
  },
  {
    device: "watch",
    label: "Uptime ring",
    detail: "Glance-able health for the inference stack and downstream APIs.",
  },
  {
    device: "tablet",
    label: "Weekly report",
    detail: "Auto-generated stakeholder digest with evals, incidents, asks.",
  },
] as const;
