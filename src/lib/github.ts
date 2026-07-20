/**
 * Live project data from GitHub — server-side only. Reads a token from the
 * environment when present; public repos work without one (ISR caching keeps
 * requests well under the anonymous limit, but a token is recommended for the
 * full dashboard since it hits several endpoints).
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

export type RepoMeta = Readonly<{
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  pushedAt: string;
  url: string;
  defaultBranch: string;
}>;

export type PullState = "open" | "merged" | "closed";
export type Pull = Readonly<{
  number: number;
  title: string;
  state: PullState;
  author: string;
  url: string;
  at: string; // most relevant timestamp (merged/updated/created)
}>;

export type Lang = Readonly<{ name: string; pct: number }>;
export type Contributor = Readonly<{ login: string; contributions: number; url: string }>;

export type Project = Readonly<{
  repo: RepoMeta;
  pulls: readonly Pull[];
  openPulls: number;
  mergedPulls: number;
  languages: readonly Lang[];
  contributors: readonly Contributor[];
}>;

/* ----------------------------- mappers ----------------------------- */

type GhRepo = {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
  html_url: string;
  default_branch: string;
};
type GhPull = {
  number: number;
  title: string;
  state: "open" | "closed";
  merged_at: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  user: { login: string } | null;
};
type GhContributor = { login: string; contributions: number; html_url: string };

export function toPull(p: GhPull): Pull {
  const state: PullState = p.merged_at ? "merged" : p.state;
  return {
    number: p.number,
    title: p.title,
    state,
    author: p.user?.login ?? "unknown",
    url: p.html_url,
    at: p.merged_at ?? p.updated_at ?? p.created_at,
  };
}

export function toLanguages(raw: Record<string, number>): Lang[] {
  const entries = Object.entries(raw);
  const total = entries.reduce((s, [, b]) => s + b, 0);
  if (total === 0) return [];
  return entries
    .map(([name, bytes]) => ({ name, pct: Math.round((bytes / total) * 1000) / 10 }))
    .sort((a, b) => b.pct - a.pct);
}

/* ----------------------------- relative time ----------------------------- */

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

/* ----------------------------- aggregate ----------------------------- */

/** Fetch the full live-project snapshot. Returns null only if the repo itself is unreachable. */
export async function fetchProject(): Promise<Project | null> {
  const [repoRaw, pullsRaw, langRaw, contribRaw] = await Promise.all([
    gh<GhRepo>(""),
    gh<GhPull[]>("/pulls?state=all&sort=updated&direction=desc&per_page=100"),
    gh<Record<string, number>>("/languages"),
    gh<GhContributor[]>("/contributors?per_page=20"),
  ]);
  if (!repoRaw) return null;

  const pullsAll = Array.isArray(pullsRaw) ? pullsRaw.map(toPull) : [];
  const openPulls = pullsAll.filter((p) => p.state === "open").length;
  const mergedPulls = pullsAll.filter((p) => p.state === "merged").length;
  const pulls = [...pullsAll].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 7);

  const languages = langRaw ? toLanguages(langRaw).slice(0, 6) : [];
  const contributors = (Array.isArray(contribRaw) ? contribRaw : [])
    .map((c): Contributor => ({ login: c.login, contributions: c.contributions, url: c.html_url }))
    .slice(0, 8);

  return {
    repo: {
      fullName: repoRaw.full_name,
      description: repoRaw.description ?? "",
      stars: repoRaw.stargazers_count,
      forks: repoRaw.forks_count,
      language: repoRaw.language,
      pushedAt: repoRaw.pushed_at,
      url: repoRaw.html_url,
      defaultBranch: repoRaw.default_branch,
    },
    pulls,
    openPulls,
    mergedPulls,
    languages,
    contributors,
  };
}
