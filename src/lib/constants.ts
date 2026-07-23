export const SITE = {
  name: "Mzwakhe Mokhatla",
  email: "mokhatla.mzwakhe@gmail.com",
  phone: "067 980 1166",
  phoneHref: "tel:+27679801166",
  location: "Pretoria, South Africa",
  tagline: "Turning ideas into digital realities.",
  cvHref: "/api/cv",
  cvFileName: "Mzwakhe_Sifiso_Mokhatla_CV.pdf",
  portrait: "/img/Potrait.png",
} as const;
export const CONTACT_INTENTS = [
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "other", label: "Something else" },
] as const;
export type ContactIntent = (typeof CONTACT_INTENTS)[number]["value"];
export const FAQS = [
  {
    q: "What kind of work do you take on?",
    a: "Full-stack product builds, microfrontend architecture, and taking an idea from first commit to something shipped and maintained. TypeScript, React and Next.js, Node, and PostgreSQL are home turf.",
  },
  {
    q: "Which working model do you prefer: onsite, remote, or hybrid?",
    a: "All three can work. I am set up for remote and collaborate with teams across regions, and hybrid or onsite is open for the right engagement around Gauteng. What matters more is your team's rhythm, so tell me what yours looks like.",
  },
  {
    q: "Where are you based, and do you work remotely?",
    a: "Pretoria, South Africa (UTC+2). I work remotely with teams anywhere, and I have delivered on-site internationally when a project called for it.",
  },
  {
    q: "How do you use AI in your work?",
    a: "Agents handle scaffolding, migrations, tests, and first drafts. I own the architecture, the review, and the call on what ships, so you get speed without lowering the bar.",
  },
  {
    q: "How soon can you start?",
    a: "It depends on scope and current load. Send a note with your timeline and we can work out the timing together.",
  },
  {
    q: "How do you price an engagement?",
    a: "Rates depend on scope and how long we work together. Tell me what you are building and I come back with a clear, honest proposal.",
  },
] as const;
export type FaqItem = (typeof FAQS)[number];
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
  { n: "05", t: "For recruiters", href: "#recruiters" },
  { n: "06", t: "Contact", href: "#contact" },
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
    d: "I build the interfaces people count on at work, accessible, responsive, and fast. Reusable component systems and design-faithful UI, translated straight from Figma into production.",
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
    d: "The contracts underneath the screen: APIs, relational data, and Azure-native services, designed to scale and stay honest from the UI all the way down to the database.",
  },
  {
    w1: "Technical",
    w2: "Leadership",
    pills: ["Code review", "Mentorship", "Architecture", "Agile · Scrum", "Sprint delivery"],
    d: "I was Acting Technical Lead on StudioSync, owning specs, component boundaries, and migrations while mentoring the team and holding engineering standards high across frontend and backend.",
  },
  {
    w1: "Platform",
    w2: "& DevOps",
    pills: ["Azure DevOps", "GitHub Actions", "Grafana", "CI/CD", "Observability"],
    d: "Pipelines and observability that make shipping calm, infrastructure as code, automated delivery, and dashboards that surface what production is actually doing.",
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
    org: "MTN Group, Roodepoort",
    when: "Mar 2024 to Apr 2026",
  },
  {
    role: "Product & Platform Engineer",
    org: "Accenture, Waterfall",
    when: "Mar 2024 to Apr 2026",
  },
  {
    role: "Frontend Engineer",
    org: "Nybble Technologies, Bryanston / Dar es Salaam",
    when: "Dec 2022 to Jun 2023",
  },
  { role: "Junior Software Developer", org: "IST, Pretoria", when: "Jan 2021, Dec 2022" },
];

export type WorkflowStep = Readonly<{ n: string; title: string; line: string }>;
export const AI_WORKFLOW: ReadonlyArray<WorkflowStep> = [
  { n: "01", title: "Edit", line: "Agents draft and refactor in the editor. I set the direction." },
  { n: "02", title: "Pair", line: "Claude on the hard parts: architecture, tricky refactors, edge cases." },
  { n: "03", title: "Verify", line: "Tests and CI must be green. Nothing ships on vibes." },
  { n: "04", title: "Ship", line: "Every diff reviewed by me, then merged and live." },
];

export type ValuePoint = Readonly<{ title: string; line: string }>;
export const AI_VALUE: ReadonlyArray<ValuePoint> = [
  {
    title: "Production-grade, not prototypes",
    line: "Every change is reviewed, tested, and gated by CI before it ships.",
  },
  {
    title: "Velocity with judgment",
    line: "Days of scope delivered in hours, without lowering the bar.",
  },
  {
    title: "Fluent across the AI stack",
    line: "Comfortable with the whole toolchain, and quick to adopt what is new.",
  },
];
