import {
  GUEST_GRANT_DAYS,
  GUEST_RESOURCE_KEYS,
  GUEST_RESOURCES,
  resourceLabel,
} from "@/lib/access/resources";

describe("GUEST_RESOURCES", () => {
  it("lists the four grantable resources in spec order", () => {
    expect(GUEST_RESOURCES.map((r) => r.key)).toEqual(["cv", "repos", "cases", "references"]);
  });
  it("pairs every key with its human-facing label", () => {
    expect(GUEST_RESOURCES.map((r) => r.label)).toEqual([
      "CV (PDF)",
      "Private repositories",
      "Deeper case studies",
      "References",
    ]);
  });
});

describe("GUEST_RESOURCE_KEYS", () => {
  it("mirrors the keys of GUEST_RESOURCES", () => {
    expect(GUEST_RESOURCE_KEYS).toEqual(GUEST_RESOURCES.map((r) => r.key));
  });
});

describe("GUEST_GRANT_DAYS", () => {
  it("is the 30-day grant window", () => {
    expect(GUEST_GRANT_DAYS).toBe(30);
  });
});

describe("resourceLabel", () => {
  it.each([
    ["cv", "CV (PDF)"],
    ["repos", "Private repositories"],
    ["cases", "Deeper case studies"],
    ["references", "References"],
  ])("maps the known key %s to its label", (key, label) => {
    expect(resourceLabel(key)).toBe(label);
  });
  it("falls back to the raw key when it is unknown", () => {
    expect(resourceLabel("mystery")).toBe("mystery");
  });
  it("returns the empty string unchanged", () => {
    expect(resourceLabel("")).toBe("");
  });
});
