import { buildTracker, completeThrough, relTime, toPull } from "@/lib/github";

describe("toPull", () => {
  it("marks a PR merged when merged_at is set, else uses its state", () => {
    expect(toPull({ title: "x", state: "closed", merged_at: "2026-07-09T00:00:00Z" }).state).toBe(
      "merged",
    );
    expect(toPull({ title: "x", state: "open", merged_at: null }).state).toBe("open");
    expect(toPull({ title: "x", state: "closed", merged_at: null }).state).toBe("closed");
  });
});

describe("completeThrough", () => {
  it("entails completion from real signals, strongest first", () => {
    expect(completeThrough(true, 40, 5)).toBe(8);
    expect(completeThrough(false, 3, 1)).toBe(6);
    expect(completeThrough(false, 0, 2)).toBe(4);
    expect(completeThrough(false, 0, 0)).toBe(0);
  });
});

describe("buildTracker", () => {
  it("marks phases complete/active/upcoming and keeps the operate loop live once deployed", () => {
    const t = buildTracker(true, 33, 5);
    expect(t.total).toBe(10);
    expect(t.completeCount).toBe(8);
    const byName = Object.fromEntries(t.phases.map((p) => [p.name, p.status]));
    expect(byName["Discovery"]).toBe("complete");
    expect(byName["Deploy"]).toBe("complete");
    expect(byName["Monitor"]).toBe("active");
    expect(byName["Iterate"]).toBe("active");
  });

  it("puts a single active frontier when not yet deployed", () => {
    const t = buildTracker(false, 3, 1);
    const byName = Object.fromEntries(t.phases.map((p) => [p.name, p.status]));
    expect(byName["Build"]).toBe("complete");
    expect(byName["Test"]).toBe("active");
    expect(byName["Deploy"]).toBe("upcoming");
    expect(byName["Iterate"]).toBe("upcoming");
  });
});

describe("relTime", () => {
  const base = new Date("2026-07-20T12:00:00Z").getTime();
  it("buckets into m / h / d", () => {
    expect(relTime("2026-07-20T11:30:00Z", base)).toBe("30m ago");
    expect(relTime("2026-07-20T09:00:00Z", base)).toBe("3h ago");
    expect(relTime("2026-07-15T12:00:00Z", base)).toBe("5d ago");
  });
});
