import {
  AI_ITEMS,
  EXPERIENCE,
  NAVLINKS,
  SERVICES,
  SITE,
  WORK,
} from "@/lib/constants";

describe("SITE identity", () => {
  it("exposes name, role, and contact email", () => {
    expect(SITE.name).toMatch(/Mzwakhe Mokhatla/);
    expect(SITE.role).toBeTruthy();
    expect(SITE.email).toMatch(/@/);
  });
});

describe("NAVLINKS", () => {
  it("is non-empty", () => {
    expect(NAVLINKS.length).toBeGreaterThan(0);
  });

  it("every link has a label and href", () => {
    for (const link of NAVLINKS) {
      expect(link.label).toBeTruthy();
      expect(link.href).toMatch(/^(#|\/)/);
    }
  });

  it("includes the recruiter access route", () => {
    expect(NAVLINKS.some((link) => link.href === "/recruiter")).toBe(true);
  });
});

describe("SERVICES", () => {
  it("renders three stacking cards", () => {
    expect(SERVICES.length).toBe(3);
  });

  it("every service has both title lines, body, and capabilities", () => {
    for (const service of SERVICES) {
      expect(service.titleLineOne).toBeTruthy();
      expect(service.titleLineTwo).toBeTruthy();
      expect(service.body.length).toBeGreaterThan(20);
      expect(service.capabilities.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("WORK", () => {
  it("uses unique slugs", () => {
    const slugs = WORK.map((w) => w.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every entry carries title, role, year, and blurb", () => {
    for (const project of WORK) {
      expect(project.title).toBeTruthy();
      expect(project.role).toBeTruthy();
      expect(project.year).toMatch(/\d{4}/);
      expect(project.blurb).toBeTruthy();
    }
  });
});

describe("EXPERIENCE", () => {
  it("is non-empty and well-shaped", () => {
    expect(EXPERIENCE.length).toBeGreaterThan(0);
    for (const row of EXPERIENCE) {
      expect(row.period).toMatch(/\d{4}/);
      expect(row.company).toBeTruthy();
      expect(row.role).toBeTruthy();
    }
  });
});

describe("AI_ITEMS", () => {
  it("covers all four device kinds", () => {
    const devices = new Set(AI_ITEMS.map((item) => item.device));
    expect(devices).toEqual(new Set(["laptop", "phone", "watch", "tablet"]));
  });
});
