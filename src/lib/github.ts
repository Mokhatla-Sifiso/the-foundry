/**
 * Live delivery timeline from GitHub pull requests. Server-side only; reads a
 * token from the environment when present (public repos work without one).
 * We surface only what's valuable — what shipped, and roughly when — not the
 * repo's vanity stats.
 */
const REPO = process.env.GITHUB_REPO ?? "Mokhatla-Sifiso/the-foundry";
const REVALIDATE_SECONDS = 300; // refresh at most every 5 minutes

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function gh<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
      headers: ghHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/* ----------------------------- types ----------------------------- */

export type PullState = "open" | "merged" | "closed";
export type Pull = Readonly<{
  number: number;
  title: string;
  state: PullState;
  createdAt: string;
  endAt: string; // merged/closed date, or now for still-open
  url: string;
}>;

export type Segment = Readonly<{ pull: Pull; left: number }>;
export type Timeline = Readonly<{ segments: readonly Segment[]; nowFrac: number }>;

export type Project = Readonly<{
  fullName: string;
  url: string;
  pushedAgo: string;
  timeline: Timeline;
}>;

/* ----------------------------- mappers ----------------------------- */

type GhRepo = { full_name: string; html_url: string; pushed_at: string };
type GhPull = {
  number: number;
  title: string;
  state: "open" | "closed";
  merged_at: string | null;
  closed_at: string | null;
  created_at: string;
  html_url: string;
};

export function toPull(p: GhPull, now: number): Pull {
  const state: PullState = p.merged_at ? "merged" : p.state;
  const end = p.merged_at ?? p.closed_at ?? new Date(now).toISOString();
  return {
    number: p.number,
    title: p.title,
    state,
    createdAt: p.created_at,
    endAt: end,
    url: p.html_url,
  };
}

export function relTime(iso: string, now: number): string {
  const s = Math.round((now - new Date(iso).getTime()) / 1000);
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.round(mo / 12)}y ago`;
}

/* --------------------------- timeline (pure) --------------------------- */

const ms = (iso: string): number => new Date(iso).getTime();

/**
 * The most recent pull requests as a clean staggered cascade — newest last,
 * flowing toward "Now". Positions are an even stagger, not exact dates: the
 * valuable signal is what shipped and in what order, not the calendar.
 */
export function buildTimeline(pulls: readonly Pull[], now: number, take = 8): Timeline | null {
  if (pulls.length === 0) return null;
  const recent = [...pulls].sort((a, b) => ms(b.endAt) - ms(a.endAt)).slice(0, take);
  const ordered = [...recent].sort((a, b) => ms(a.endAt) - ms(b.endAt)); // oldest → newest
  const n = ordered.length;
  const segments: Segment[] = ordered.map((pull, i) => ({
    pull,
    left: n > 1 ? (i / (n - 1)) * 0.56 : 0,
  }));
  return { segments, nowFrac: 0.97 };
}

/* ----------------------------- aggregate ----------------------------- */

export async function fetchProject(): Promise<Project | null> {
  const now = Date.now();
  const [repo, pullsRaw] = await Promise.all([
    gh<GhRepo>(""),
    gh<GhPull[]>("/pulls?state=all&sort=updated&direction=desc&per_page=30"),
  ]);
  if (!repo) return null;

  const pulls = Array.isArray(pullsRaw) ? pullsRaw.map((p) => toPull(p, now)) : [];
  const timeline = buildTimeline(pulls, now);
  if (!timeline) return null;

  return {
    fullName: repo.full_name,
    url: repo.html_url,
    pushedAgo: relTime(repo.pushed_at, now),
    timeline,
  };
}
