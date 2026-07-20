import { relTime, toLanguages, toPull } from "@/lib/github";

const rawPull = (o: Partial<Parameters<typeof toPull>[0]> = {}) => ({
  number: 40,
  title: "feat: live tracker",
  state: "closed" as const,
  merged_at: null as string | null,
  created_at: "2026-07-01T00:00:00Z",
  updated_at: "2026-07-10T00:00:00Z",
  html_url: "https://github.com/x/y/pull/40",
  user: { login: "muzi" },
  ...o,
});

describe("toPull", () => {
  it("marks a PR merged when merged_at is set, regardless of state", () => {
    expect(toPull(rawPull({ state: "closed", merged_at: "2026-07-09T00:00:00Z" })).state).toBe("merged");
  });
  it("keeps open / closed states and picks the author + newest timestamp", () => {
    expect(toPull(rawPull({ state: "open" })).state).toBe("open");
    const p = toPull(rawPull({ state: "closed" }));
    expect(p.state).toBe("closed");
    expect(p.author).toBe("muzi");
    expect(p.at).toBe("2026-07-10T00:00:00Z");
  });
});

describe("toLanguages", () => {
  it("converts byte counts into sorted percentages that cover the whole", () => {
    const langs = toLanguages({ CSS: 250, TypeScript: 750 });
    expect(langs[0]).toEqual({ name: "TypeScript", pct: 75 });
    expect(langs[1]).toEqual({ name: "CSS", pct: 25 });
  });
  it("returns nothing for an empty repo", () => {
    expect(toLanguages({})).toEqual([]);
  });
});

describe("relTime", () => {
  const base = new Date("2026-07-20T12:00:00Z").getTime();
  it("buckets into m / h / d / mo", () => {
    expect(relTime("2026-07-20T11:30:00Z", base)).toBe("30m ago");
    expect(relTime("2026-07-20T09:00:00Z", base)).toBe("3h ago");
    expect(relTime("2026-07-15T12:00:00Z", base)).toBe("5d ago");
    expect(relTime("2026-05-20T12:00:00Z", base)).toMatch(/mo ago/);
  });
});
