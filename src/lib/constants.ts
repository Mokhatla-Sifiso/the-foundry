export const SITE = {
  name: "Mzwakhe Mokhatla",
  email: "mokhatla.mzwakhe@gmail.com",
  phone: "067 980 1166",
  phoneHref: "tel:+27679801166",
  location: "Pretoria, South Africa",
  tagline: "Turning ideas into digital realities.",
  cvHref: "/cv/Mzwakhe_Sifiso_Mokhatla_CV.pdf",
  portrait: "/img/Potrait.png",
} as const;
export type NavLink = Readonly<{
  n: string;
  t: string;
  href: string;
}>;
export const NAVLINKS: ReadonlyArray<NavLink> = [
  { n: "01", t: "Work", href: "#work" },
  { n: "02", t: "Services", href: "#services" },
  { n: "03", t: "AI Workflow", href: "#ai" },
  { n: "04", t: "Experience", href: "#experience" },
  { n: "05", t: "Contact", href: "#contact" },
];
export type Service = Readonly<{
  w1: string;
  w2: string;
  pills: ReadonlyArray<string>;
  d: string;
}>;
export const SERVICES: ReadonlyArray<Service> = [
  {
    w1: "Frontend",
    w2: "Engineering",
    pills: ["React", "TypeScript", "Next.js", "Microfrontends", "UI/UX"],
    d: "I build the interfaces people count on at work — accessible, responsive, and fast. Reusable component systems and design-faithful UI, translated straight from Figma into production.",
  },
  {
    w1: "Full-Stack",
    w2: "& Cloud",
    pills: [
      "Node · NestJS",
      "Azure Functions",
      "REST APIs",
      "PostgreSQL",
      "Pulumi · IaC",
      "Docker",
    ],
    d: "The contracts underneath the screen: APIs, relational data, and Azure-native services — designed to scale and stay honest from the UI all the way down to the database.",
  },
  {
    w1: "Technical",
    w2: "Leadership",
    pills: ["Code review", "Mentorship", "Architecture", "Agile · Scrum", "Sprint delivery"],
    d: "Acting Technical Lead on StudioSync — owning specs, component boundaries, and migrations while mentoring the team and holding engineering standards high across frontend and backend.",
  },
  {
    w1: "Platform",
    w2: "& DevOps",
    pills: ["Azure DevOps", "GitHub Actions", "Grafana", "CI/CD", "Observability"],
    d: "Pipelines and observability that make shipping calm — infrastructure as code, automated delivery, and dashboards that surface what production is actually doing.",
  },
];
export type Work = Readonly<{
  nm: string;
  og: string;
  tag: string;
  slot: string;
}>;
export const WORK: ReadonlyArray<Work> = [
  { nm: "StudioSync", og: "MTN Group · Technical Lead", tag: "Platform", slot: "work-studiosync" },
  { nm: "Bayobab Client Portal", og: "Accenture · MTN", tag: "Frontend", slot: "work-bayobab" },
  { nm: "e-Teller", og: "Nybble · NMB Bank, Tanzania", tag: "Fintech", slot: "work-eteller" },
  { nm: "GE Smallworld GIS", og: "IST · Spatial systems", tag: "GIS", slot: "work-gis" },
];
export type XpRow = Readonly<{
  role: string;
  org: string;
  when: string;
  now?: boolean;
}>;
export const XP: ReadonlyArray<XpRow> = [
  {
    role: "Software Engineer · Tech Lead",
    org: "MTN Group — Roodepoort",
    when: "Mar 2024 — Present",
    now: true,
  },
  {
    role: "Product & Platform Engineer",
    org: "Accenture — Waterfall",
    when: "Mar 2024 — Present",
    now: true,
  },
  {
    role: "Frontend Engineer",
    org: "Nybble Technologies — Bryanston / Dar es Salaam",
    when: "Dec 2022 — Jun 2023",
  },
  { role: "Junior Software Developer", org: "IST — Pretoria", when: "Jan 2021 — Dec 2022" },
];
export type AiItem = Readonly<{
  t: string;
  d: string;
  tools: ReadonlyArray<string>;
}>;
export const AIITEMS: ReadonlyArray<AiItem> = [
  {
    t: "AI pair-programming",
    d: "Cursor and Copilot handle scaffolding, refactors, and the tedious parts of a migration — so I stay in flow while the boilerplate writes itself.",
    tools: ["Cursor", "Copilot"],
  },
  {
    t: "Rapid prototyping",
    d: "I stand up UI prototypes and explore several directions in minutes with LLMs, then keep only what earns its place in the product.",
    tools: ["LLM prompting", "Prototyping"],
  },
  {
    t: "Tests & documentation",
    d: "Generating unit and integration tests, surfacing edge cases, and drafting docs keeps the codebase understandable as it grows.",
    tools: ["Test generation", "Docs"],
  },
  {
    t: "Review & research",
    d: "A second pass on pull requests, plus tracking new AI tooling and folding what genuinely works into the team's everyday practice.",
    tools: ["PR review", "AI trends"],
  },
];
export const ASSISTANT_NAME = "Clerk";
export const PEAK_COLOR = "#020202";
