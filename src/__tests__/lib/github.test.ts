import { buildTimeline, toMilestone, type Milestone } from "@/lib/github";

const raw = (o: Partial<Parameters<typeof toMilestone>[0]> = {}) => ({
  number: 1,
  title: "Phase",
  state: "open" as const,
  open_issues: 0,
  closed_issues: 0,
  created_at: "2026-01-01T00:00:00Z",
  due_on: null,
  closed_at: null,
  html_url: "https://github.com/x/y/milestone/1",
  ...o,
});

describe("toMilestone", () => {
  it("computes progress as closed / total", () => {
    const m = toMilestone(raw({ open_issues: 2, closed_issues: 3 }));
    expect(m.total).toBe(5);
    expect(m.progress).toBeCloseTo(0.6, 5);
  });

  it("treats a closed milestone with no issues as complete, an open one as 0", () => {
    expect(toMilestone(raw({ state: "closed" })).progress).toBe(1);
    expect(toMilestone(raw({ state: "open" })).progress).toBe(0);
  });
});

const ms = (o: Partial<Milestone>): Milestone => ({
  number: 1,
  title: "Phase",
  state: "open",
  open: 0,
  closed: 0,
  total: 0,
  progress: 0,
  createdAt: "2026-01-01T00:00:00Z",
  dueOn: null,
  closedAt: null,
  url: "https://github.com/x/y/milestone/1",
  ...o,
});

describe("buildTimeline", () => {
  it("returns null when there are no milestones", () => {
    expect(buildTimeline([], Date.now())).toBeNull();
  });

  it("projects milestones onto a 0..1 axis with a Now position and month ticks", () => {
    const now = new Date("2026-02-15T00:00:00Z").getTime();
    const t = buildTimeline(
      [
        ms({ number: 1, title: "Setup", createdAt: "2026-01-01T00:00:00Z", dueOn: "2026-01-20T00:00:00Z" }),
        ms({ number: 2, title: "Build", createdAt: "2026-01-15T00:00:00Z", dueOn: "2026-03-01T00:00:00Z" }),
      ],
      now,
    )!;
    expect(t).not.toBeNull();
    expect(t.segments).toHaveLength(2);
    for (const s of t.segments) {
      expect(s.left).toBeGreaterThanOrEqual(0);
      expect(s.left + s.width).toBeLessThanOrEqual(1.0001);
      expect(s.width).toBeGreaterThan(0);
    }
    expect(t.nowFrac).toBeGreaterThan(0);
    expect(t.nowFrac).toBeLessThan(1);
    expect(t.months.length).toBeGreaterThan(0);
    // ordered by end date
    expect(t.segments[0].milestone.title).toBe("Setup");
  });
});
