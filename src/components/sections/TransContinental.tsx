"use client";

import { useState, useRef, useEffect } from "react";
import { Reveal } from "@/components/primitives/Reveal";

type Location = Readonly<{
  id: string;
  city: string;
  country: string;
  org: string;
  role: string;
  when: string;
  dayToDay: string;
  core: ReadonlyArray<string>;
  deliverables: ReadonlyArray<string>;
  order: number;
  lat: number;
  lng: number;
  offsetX?: number;
  offsetY?: number;
  labelAnchor?: "start" | "end";
}>;

const LOCATIONS: ReadonlyArray<Location> = [
  {
    id: "pretoria",
    city: "Pretoria",
    country: "South Africa",
    org: "IST",
    role: "Junior Software Developer & Intern",
    when: "Jan 2021 to Dec 2022",
    dayToDay:
      "Customising utility GIS software and migrating spatial data on the GE Smallworld Magik platform.",
    core: [
      "Magik development across Electric Office and Physical Network Inventory",
      "Data migration and GE Mobile Enterprise customisation (JSON, XML)",
      "Formal training in Magik, EO Admin and spatial databases",
    ],
    deliverables: [
      "Customised Electric Office and mobile-enterprise modules",
      "Spatial datasets migrated into production GIS systems",
    ],
    order: 1,
    lat: -25.73,
    lng: 28.19,
    offsetX: 70,
    offsetY: -110,
    labelAnchor: "start",
  },
  {
    id: "bryanston",
    city: "Bryanston",
    country: "South Africa",
    org: "Nybble Technologies",
    role: "Frontend Engineer",
    when: "Dec 2022 to Jun 2023",
    dayToDay:
      "Building responsive React UI over a Postgres backend and demoing progress straight to clients.",
    core: [
      "Responsive components in ReactJS + Redux on PostgreSQL",
      "GitHub, Azure DevOps and Postman in the daily workflow",
      "Client-facing collaboration and product demos",
    ],
    deliverables: [
      "Reusable, responsive front-end component set",
      "Live product demos delivered to clients",
    ],
    order: 2,
    lat: -26.05,
    lng: 28.03,
    offsetX: -90,
    offsetY: -30,
    labelAnchor: "end",
  },
  {
    id: "dar",
    city: "Dar es Salaam",
    country: "Tanzania",
    org: "Nybble · NMB Bank",
    role: "Frontend Engineer (e-Teller)",
    when: "Dec 2022 to Jun 2023",
    dayToDay:
      "On the ground in Tanzania, hardening and releasing the e-Teller banking app with NMB's team.",
    core: [
      "Led testing and deployment of the e-Teller app",
      "On-site international delivery at NMB Bank",
      "Direct collaboration with the client's banking team",
    ],
    deliverables: [
      "e-Teller app tested and deployed into NMB's environment",
      "In-country release and handover to the bank",
    ],
    order: 3,
    lat: -6.79,
    lng: 39.21,
    offsetX: -30,
    labelAnchor: "end",
  },
  {
    id: "roodepoort",
    city: "Roodepoort",
    country: "South Africa",
    org: "MTN Group",
    role: "Software Engineer · Acting Tech Lead",
    when: "Mar 2024 to Apr 2026",
    dayToDay:
      "Led StudioSync sprints, reviews and mentoring while building microfrontends across MTN's internal platforms.",
    core: [
      "Acting Technical Lead on StudioSync (payroll & contract platform)",
      "Microfrontends for Kente, Bayobab BSP Portal, HR Assist, Knowledge Base",
      "React/TypeScript, Azure Functions, Pulumi IaC, PostgreSQL, Grafana",
      "Code reviews, engineering standards and mentoring juniors",
    ],
    deliverables: [
      "Time reporting, people and contract-management modules",
      "Compliance dashboards and administrative insights",
      "Component standardisation rollout; quarterly exec demos",
    ],
    order: 4,
    lat: -26.17,
    lng: 27.87,
    offsetX: -90,
    offsetY: 70,
    labelAnchor: "end",
  },
  {
    id: "waterfall",
    city: "Waterfall",
    country: "South Africa",
    org: "Accenture",
    role: "Software Product & Platform Engineer",
    when: "Mar 2024 to Apr 2026",
    dayToDay:
      "Shaped the Bayobab Client Portal's architecture and moved its backend from Java to TypeScript.",
    core: [
      "Frontend architecture for the Bayobab Client Portal",
      "Java to TypeScript backend migration",
      "Product discovery, technical direction and documentation",
      "Architecture and tooling standards in a Scrum team",
    ],
    deliverables: [
      "Backend services moved onto maintainable TypeScript",
      "Architectural guidance, tooling standards and mentoring",
    ],
    order: 5,
    lat: -25.99,
    lng: 28.13,
    offsetX: 70,
    offsetY: 30,
    labelAnchor: "start",
  },
];

const VB_W = 800;
const VB_H = 500;
const LAT_TOP = -4;
const LAT_BOTTOM = -32;
const LNG_LEFT = 17;
const LNG_RIGHT = 43;

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LNG_LEFT) / (LNG_RIGHT - LNG_LEFT)) * VB_W;
  const y = ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * VB_H;
  return { x, y };
}

const COAST_PATH =
  "M 80 60 " +
  "Q 220 40 320 90 " +
  "Q 420 130 520 110 " +
  "Q 640 95 720 130 " +
  "Q 760 200 700 270 " +
  "Q 640 340 540 360 " +
  "Q 460 380 380 420 " +
  "Q 300 460 220 440 " +
  "Q 120 415 80 340 " +
  "Q 50 230 80 60 Z";

export function TransContinental(): React.ReactElement {
  const [activeId, setActiveId] = useState<string>(LOCATIONS[0].id);
  const active = LOCATIONS.find((l) => l.id === activeId) ?? LOCATIONS[0];
  const points = LOCATIONS.map((l) => {
    const p = project(l.lat, l.lng);
    return { ...l, x: p.x + (l.offsetX ?? 0), y: p.y + (l.offsetY ?? 0) };
  });
  const ordered = [...points].sort((a, b) => a.order - b.order);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);

  useEffect(() => {
    const el = pathRef.current;
    if (el && typeof el.getTotalLength === "function") {
      setPathLen(el.getTotalLength());
    }
  }, []);

  const journeyPath = ordered
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = ordered[i - 1];
      const cx = (prev.x + p.x) / 2;
      const cy = Math.min(prev.y, p.y) - 50;
      return `Q ${cx} ${cy} ${p.x} ${p.y}`;
    })
    .join(" ");

  return (
    <section id="transcontinental" className="sec trans-sec">
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          Transcontinental
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="trans-h">
            Two countries,<br />
            <span className="em">one team at a time.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="trans-lead">
            Every project on this site shipped from one of these benches. Tap a city to see who I
            was working with and what we built together.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="trans-shell">
          <div className="trans-map-wrap" role="figure" aria-label="Cities I have worked from">
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              preserveAspectRatio="xMidYMid meet"
              className="trans-svg"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="trans-grid"
                  width="22"
                  height="22"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1.1" fill="currentColor" opacity="0.18" />
                </pattern>
                <radialGradient id="trans-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--candy)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--candy)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width={VB_W} height={VB_H} fill="url(#trans-grid)" />

              <path
                d={COAST_PATH}
                fill="currentColor"
                opacity="0.045"
                stroke="currentColor"
                strokeOpacity="0.18"
                strokeWidth="1.2"
                strokeDasharray="2 6"
              />

              <path
                ref={pathRef}
                d={journeyPath}
                fill="none"
                stroke="var(--candy)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray={pathLen}
                strokeDashoffset={pathLen}
                style={{
                  transition: "stroke-dashoffset 1.8s ease 0.3s",
                  strokeDashoffset: 0,
                }}
              />

              {points.map((p) => {
                const isActive = p.id === activeId;
                return (
                  <g
                    key={p.id}
                    transform={`translate(${p.x}, ${p.y})`}
                    className={`trans-pin${isActive ? " trans-pin--active" : ""}`}
                    onClick={() => setActiveId(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveId(p.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${p.city}, ${p.country}: ${p.org}, ${p.role}`}
                    aria-pressed={isActive}
                  >
                    <circle r="22" fill="url(#trans-glow)" className="trans-pin-halo" />
                    <circle r="10" fill="var(--candy)" opacity="0.18" className="trans-pin-ring" />
                    <circle r="5" fill="var(--candy)" className="trans-pin-dot" />
                    <text
                      x={p.labelAnchor === "end" ? -12 : 12}
                      y="4"
                      textAnchor={p.labelAnchor === "end" ? "end" : "start"}
                      className="trans-pin-label"
                      fill="currentColor"
                      fontSize="13"
                      fontWeight="600"
                    >
                      {p.city}
                    </text>
                  </g>
                );
              })}
            </svg>

            <ul className="trans-chips" aria-label="Locations">
              {points.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`trans-chip${p.id === activeId ? " trans-chip--active" : ""}`}
                    onClick={() => setActiveId(p.id)}
                    aria-pressed={p.id === activeId}
                  >
                    <span className="trans-chip-dot" aria-hidden="true" />
                    {p.city}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <aside className="trans-panel" aria-live="polite">
            <span className="trans-panel-eyebrow">Now showing</span>
            <h3 className="trans-panel-city">
              {active.city}
              <span className="trans-panel-country">, {active.country}</span>
            </h3>
            <p className="trans-panel-org">{active.org}</p>
            <p className="trans-panel-role">{active.role}</p>
            <p className="trans-panel-when">{active.when}</p>

            <div className="trans-panel-body">
              <div className="trans-panel-block">
                <span className="trans-panel-label">Day to day</span>
                <p className="trans-panel-day">{active.dayToDay}</p>
              </div>
              <div className="trans-panel-block">
                <span className="trans-panel-label">Core</span>
                <ul className="trans-panel-list">
                  {active.core.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="trans-panel-block">
                <span className="trans-panel-label">Deliverables</span>
                <ul className="trans-panel-list">
                  {active.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
