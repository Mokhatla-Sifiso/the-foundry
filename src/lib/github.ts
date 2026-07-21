/* ================================================================== *
 * Live delivery tracking, from the connected GitHub repository.
 *
 * The phases are fixed and real — the Problem-to-Solution delivery
 * model. What is LIVE is where the project sits on that path and the
 * repo's vitality (shipped/open work, last push), pulled server-side
 * with ISR. Every number shown is a real GitHub signal; nothing here
 * is invented. Completion is *entailed*, not guessed: a deployed
 * product means Discovery..Deploy happened; merged feature work means
 * Discovery..Build happened.
 * ================================================================== */

const REPO = process.env.GITHUB_REPO ?? "Mokhatla-Sifiso/the-foundry";
const REVALIDATE_SECONDS = 300;
const API = "https://api.github.com";

export interface Pull {
  title: string;
  state: "open" | "merged" | "closed";
}

export type PhaseStatus = "complete" | "active" | "upcoming";

export interface Phase {
  name: string;
  deliverable: string;
  status: PhaseStatus;
}

export interface Tracker {
  phases: Phase[];
  currentIndex: number;
  completeCount: number;
  total: number;
}

export interface Project {
  fullName: string;
  url: string;
  pushedAgo: string;
  shipped: number; // merged PRs
  inProgress: number; // open PRs
  tracker: Tracker;
}

interface PhaseDef {
  readonly name: string;
  readonly deliverable: string;
}

const PHASE_DEFS: readonly PhaseDef[] = [
  { name: "Discovery", deliverable: "Signals, stakeholder interviews, domain research" },
  { name: "Problem Definition", deliverable: "Framed problem, success metrics, constraints" },
  { name: "Solution Architecture", deliverable: "System context, runtime design, tech decisions" },
  { name: "Requirements", deliverable: "Functional and non-functional specs, acceptance criteria" },
  { name: "Design", deliverable: "UX flows, interface contracts, data models" },
  { name: "Build", deliverable: "Production code, integrations, infrastructure" },
  { name: "Test", deliverable: "Unit, integration, end-to-end, coverage gates" },
  { name: "Deploy", deliverable: "CI/CD pipeline, environments, release" },
  { name: "Monitor", deliverable: "Telemetry, tracing, alerting, SLOs" },
  { name: "Iterate", deliverable: "Feedback, hardening, next increment" },
];

const DEPLOY_INDEX = 7; // index of "Deploy"
const OPERATE_START = 8; // "Monitor" onward is the continuous operate loop

interface RawPull {
  title: string;
  state: string;
  merged_at: string | null;
}
interface RawRepo {
  full_name: string;
  html_url: string;
  homepage: string | null;
  pushed_at: string;
}
interface RawDeployment {
  id: number;
}

function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function gh<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: ghHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function toPull(p: RawPull): Pull {
  if (p.merged_at) return { title: p.title, state: "merged" };
  return { title: p.title, state: p.state === "open" ? "open" : "closed" };
}

export function relTime(iso: string, now: number): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/**
 * How many phases are complete, entailed by real signals:
 *  - deployed product  → Discovery..Deploy (8)
 *  - merged feature work → Discovery..Build (6)
 *  - only open work    → Discovery..Requirements (4)
 *  - nothing yet       → Discovery underway (0)
 */
export function completeThrough(deployed: boolean, merged: number, open: number): number {
  if (deployed) return DEPLOY_INDEX + 1;
  if (merged > 0) return 6;
  if (open > 0) return 4;
  return 0;
}

export function buildTracker(deployed: boolean, merged: number, open: number): Tracker {
  const completeCount = completeThrough(deployed, merged, open);
  const phases = PHASE_DEFS.map((def, i): Phase => {
    let status: PhaseStatus;
    if (i < completeCount) status = "complete";
    else if (deployed && i >= OPERATE_START) status = "active"; // monitor + iterate: the live loop
    else if (i === completeCount) status = "active"; // the current frontier
    else status = "upcoming";
    return { name: def.name, deliverable: def.deliverable, status };
  });
  return { phases, currentIndex: completeCount, completeCount, total: PHASE_DEFS.length };
}

export async function fetchProject(): Promise<Project | null> {
  const [repo, rawPulls, deployments] = await Promise.all([
    gh<RawRepo>(`/repos/${REPO}`),
    gh<RawPull[]>(`/repos/${REPO}/pulls?state=all&per_page=100`),
    gh<RawDeployment[]>(`/repos/${REPO}/deployments?per_page=1`),
  ]);
  if (!repo) return null;

  const pulls = (rawPulls ?? []).map(toPull);
  const shipped = pulls.filter((p) => p.state === "merged").length;
  const inProgress = pulls.filter((p) => p.state === "open").length;
  const deployed = (Array.isArray(deployments) && deployments.length > 0) || Boolean(repo.homepage);

  return {
    fullName: repo.full_name,
    url: repo.html_url,
    pushedAgo: relTime(repo.pushed_at, Date.now()),
    shipped,
    inProgress,
    tracker: buildTracker(deployed, shipped, inProgress),
  };
}
