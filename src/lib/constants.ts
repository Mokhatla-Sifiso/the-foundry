/**
 * Single source of truth for site copy. Sections render straight from these
 * arrays — editing copy never requires touching component JSX.
 *
 * Shapes are readonly so a section accidentally pushing/splicing won't compile;
 * the discriminated unions and the `as const` literals also give component
 * authors autocomplete on every field.
 */

// ──────────────────────────────────────────────────────────────────────────
// Site identity

export const SITE = {
  name: "Mzwakhe Mokhatla",
  shortName: "Mzwakhe",
  role: "Software Engineer & Co-founder",
  tagline: "Microfrontend specialist building AI-centric products.",
  email: "mokhatla.mzwakhe@gmail.com",
  location: "Johannesburg, South Africa",
} as const;

// ──────────────────────────────────────────────────────────────────────────
// Navigation

export type NavLink = Readonly<{
  /** Display label, e.g. "Work" */
  label: string;
  /** In-page anchor (`#work`) or absolute path (`/recruiter`) */
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

// ──────────────────────────────────────────────────────────────────────────
// Services (stacking dark cards)

export type Service = Readonly<{
  /** Top line of the card title, e.g. "Microfrontend" */
  titleLineOne: string;
  /** Second line of the card title, e.g. "Architecture" */
  titleLineTwo: string;
  body: string;
  /** Short capability bullets shown alongside the body copy */
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
    body: "Production LLM workflows behind real product surfaces — proxied calls, traced runs, evaluated outputs. Local models for the sensitive bits, hosted models for the rest.",
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

// ──────────────────────────────────────────────────────────────────────────
// Work (2-up project grid)

export type Work = Readonly<{
  slug: string;
  title: string;
  role: string;
  year: string;
  blurb: string;
  /** Public URL — `null` for NDA / in-progress projects */
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

// ──────────────────────────────────────────────────────────────────────────
// Experience (timeline rows)

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
    role: "Acting Technical Lead — StudioSync",
    blurb:
      "Owns the microfrontend platform's architecture and release cadence. Coaches three squads on contract-driven remote development.",
  },
  {
    period: "2024 – present",
    company: "Accenture",
    role: "Software Product Engineer — Bayobab",
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

// ──────────────────────────────────────────────────────────────────────────
// AI section (device-mockup items)

export type AiItem = Readonly<{
  device: "laptop" | "phone" | "watch" | "tablet";
  /** One-line label rendered in the section list */
  label: string;
  /** Short caption explaining what's happening on the device */
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
