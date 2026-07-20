/**
 * Live project data from GitHub milestones. Server-side only — reads a
 * token from the environment when present (public repos work without one,
 * thanks to ISR caching keeping requests well under the anonymous limit).
 *
 * Not marked "use client"; only ever imported by the server-rendered
 * WorkflowPlan. The `next.revalidate` fetch option is a no-op on the client.
 */
const REPO = process.env.GITHUB_REPO ?? "Mokhatla-Sifiso/the-foundry";
const REVALIDATE_SECONDS = 300; // refresh at most every 5 minutes

export type Milestone = Readonly<{
  number: number;
  title: string;
  state: "open" | "closed";
  open: number;
  closed: number;
  total: number;
  progress: number; // 0..1
  createdAt: string;
  dueOn: string | null;
  closedAt: string | null;
  url: string;
}>;

type GhMilestone = Readonly<{
  number: number;
  title: string;
  state: "open" | "closed";
  open_issues: number;
  closed_issues: number;
  created_at: string;
  due_on: string | null;
  closed_at: string | null;
  html_url: string;
}>;

export function toMilestone(m: GhMilestone): Milestone {
  const total = m.open_issues + m.closed_issues;
  const progress = total > 0 ? m.closed_issues / total : m.state === "closed" ? 1 : 0;
  return {
    number: m.number,
    title: m.title,
    state: m.state,
    open: m.open_issues,
    closed: m.closed_issues,
    total,
    progress,
    createdAt: m.created_at,
    dueOn: m.due_on,
    closedAt: m.closed_at,
    url: m.html_url,
  };
}

export const REPO_SLUG = REPO;
export const MILESTONES_URL = `https://github.com/${REPO}/milestones`;

/** Fetch all milestones (open + closed), newest due last. Never throws. */
export async function fetchMilestones(): Promise<readonly Milestone[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/milestones?state=all&per_page=100&sort=due_on&direction=asc`,
      { headers, next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as GhMilestone[];
    if (!Array.isArray(data)) return [];
    return data.map(toMilestone);
  } catch {
    return [];
  }
}

/* ---------------- timeline projection (pure, testable) ---------------- */

export type Segment = Readonly<{ milestone: Milestone; left: number; width: number }>;
export type MonthTick = Readonly<{ label: string; frac: number }>;
export type Timeline = Readonly<{
  segments: readonly Segment[];
  months: readonly MonthTick[];
  nowFrac: number;
  repo: string;
  url: string;
}>;

const DAY = 86_400_000;
const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

/** Project milestones onto a 0..1 timeline. Returns null when there's nothing to show. */
export function buildTimeline(milestones: readonly Milestone[], now: number): Timeline | null {
  if (milestones.length === 0) return null;

  const startOf = (m: Milestone): number => new Date(m.createdAt).getTime();
  const endOf = (m: Milestone): number =>
    new Date(m.dueOn ?? m.closedAt ?? new Date(now).toISOString()).getTime();

  let min = Infinity;
  let max = -Infinity;
  for (const m of milestones) {
    min = Math.min(min, startOf(m));
    max = Math.max(max, endOf(m));
  }
  max = Math.max(max, now);
  // pad so bars never touch the edges; guarantee a non-zero span
  const rawSpan = Math.max(max - min, DAY);
  const pad = rawSpan * 0.06;
  const start = min - pad;
  const span = rawSpan + pad * 2;

  const ordered = [...milestones].sort((a, b) => endOf(a) - endOf(b));
  const segments: Segment[] = ordered.map((m) => {
    const left = clamp01((startOf(m) - start) / span);
    const right = clamp01((endOf(m) - start) / span);
    return { milestone: m, left, width: Math.max(right - left, 0.04) };
  });

  const months = monthTicks(start, span);
  const nowFrac = clamp01((now - start) / span);
  return { segments, months, nowFrac, repo: REPO, url: MILESTONES_URL };
}

function monthTicks(start: number, span: number): MonthTick[] {
  const ticks: MonthTick[] = [];
  const first = new Date(start);
  const cursor = new Date(first.getFullYear(), first.getMonth(), 1);
  if (cursor.getTime() < start) cursor.setMonth(cursor.getMonth() + 1);
  const end = start + span;
  // avoid crowding: step across months, thinning out for long ranges
  const monthsSpan = span / (DAY * 30);
  const step = monthsSpan > 9 ? 2 : 1;
  let i = 0;
  while (cursor.getTime() <= end && ticks.length < 12) {
    if (i % step === 0) {
      ticks.push({
        label: cursor.toLocaleString("en-US", { month: "short" }),
        frac: clamp01((cursor.getTime() - start) / span),
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
    i += 1;
  }
  return ticks;
}
