import { buildTimeline, relTime, toPull, type Pull } from "@/lib/github";

const NOW = new Date("2026-07-20T12:00:00Z").getTime();

const rawPull = (o: Partial<Parameters<typeof toPull>[0]> = {}) => ({
  number: 40,
  title: "feat: live tracker",
  state: "closed" as const,
  merged_at: null as string | null,
  closed_at: null as string | null,
  created_at: "2026-07-01T00:00:00Z",
  html_url: "https://github.com/x/y/pull/40",
  ...o,
});

describe("toPull", () => {
  it("marks a PR merged when merged_at is set and uses it as the end", () => {
    const p = toPull(rawPull({ state: "closed", merged_at: "2026-07-09T00:00:00Z" }), NOW);
    expect(p.state).toBe("merged");
    expect(p.endAt).toBe("2026-07-09T00:00:00Z");
  });
  it("leaves an open PR open and ends it at now", () => {
    const p = toPull(rawPull({ state: "open" }), NOW);
    expect(p.state).toBe("open");
    expect(new Date(p.endAt).getTime()).toBe(NOW);
  });
});

const pull = (o: Partial<Pull>): Pull => ({
  number: 1,
  title: "PR",
  state: "merged",
  createdAt: "2026-06-01T00:00:00Z",
  endAt: "2026-06-05T00:00:00Z",
  url: "https://github.com/x/y/pull/1",
  ...o,
});

describe("buildTimeline", () => {
  it("returns null for no pulls", () => {
    expect(buildTimeline([], NOW)).toBeNull();
  });
  it("staggers recent pulls oldest→newest with positions inside the plot", () => {
    const t = buildTimeline(
      [
        pull({ number: 2, title: "Auth", endAt: "2026-07-18T00:00:00Z" }),
        pull({ number: 1, title: "Setup", endAt: "2026-06-10T00:00:00Z" }),
      ],
      NOW,
    )!;
    expect(t.segments).toHaveLength(2);
    expect(t.segments[0].pull.title).toBe("Setup"); // oldest first
    expect(t.segments[0].left).toBe(0);
    for (const s of t.segments) expect(s.left).toBeLessThan(1);
    expect(t.nowFrac).toBeGreaterThan(0.5);
  });
  it("keeps only the most recent N", () => {
    const many = Array.from({ length: 15 }, (_, i) =>
      pull({ number: i, endAt: `2026-06-${String((i % 28) + 1).padStart(2, "0")}T00:00:00Z` }),
    );
    expect(buildTimeline(many, NOW, 8)!.segments).toHaveLength(8);
  });
});

describe("relTime", () => {
  it("buckets into m / h / d / mo", () => {
    expect(relTime("2026-07-20T11:30:00Z", NOW)).toBe("30m ago");
    expect(relTime("2026-07-20T09:00:00Z", NOW)).toBe("3h ago");
    expect(relTime("2026-07-15T12:00:00Z", NOW)).toBe("5d ago");
  });
});
