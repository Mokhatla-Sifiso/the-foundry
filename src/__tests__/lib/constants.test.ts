import { NAVLINKS, SERVICES, SITE, WORK, XP } from "@/lib/constants";
describe("SITE", () => {
  it("carries the spec identity strings verbatim", () => {
    expect(SITE.name).toBe("Mzwakhe Mokhatla");
    expect(SITE.email).toBe("mokhatla.mzwakhe@gmail.com");
    expect(SITE.phone).toBe("067 980 1166");
    expect(SITE.phoneHref).toBe("tel:+27679801166");
    expect(SITE.location).toBe("Pretoria, South Africa");
    expect(SITE.tagline).toBe("Turning ideas into digital realities.");
  });
  it("serves the CV through the gated endpoint and keeps the portrait under /public", () => {
    expect(SITE.cvHref).toBe("/api/cv");
    expect(SITE.cvFileName).toBe("Mzwakhe_Sifiso_Mokhatla_CV.pdf");
    expect(SITE.portrait).toBe("/img/Potrait.png");
  });
});
describe("NAVLINKS", () => {
  it("is the six entries in order with the right numbering", () => {
    expect(NAVLINKS.map((l) => `${l.n} ${l.t} ${l.href}`)).toEqual([
      "01 Work #work",
      "02 Services #services",
      "03 AI Workflow #ai",
      "04 Experience #experience",
      "05 For recruiters #recruiters",
      "06 Contact #contact",
    ]);
  });
  it("every in-page nav href targets a section id that exists on the home page", () => {
    const HOME_SECTION_IDS = new Set([
      "work",
      "services",
      "ai",
      "experience",
      "recruiters",
      "contact",
    ]);
    for (const link of NAVLINKS) {
      expect(HOME_SECTION_IDS.has(link.href.replace("#", ""))).toBe(true);
    }
  });
});
describe("SERVICES", () => {
  it("is exactly the four spec services in order", () => {
    expect(SERVICES.map((s) => `${s.w1} ${s.w2}`)).toEqual([
      "Frontend Engineering",
      "Full-Stack & Cloud",
      "Technical Leadership",
      "Platform & DevOps",
    ]);
  });
  it("Frontend service has the spec pills + body", () => {
    const fe = SERVICES[0];
    expect(fe.pills).toEqual(["React", "TypeScript", "Next.js", "Microfrontends", "UI/UX"]);
    expect(fe.d).toMatch(/accessible, responsive, and fast/);
  });
});
describe("WORK", () => {
  it("is the four spec projects in order with the right tags + slots", () => {
    expect(WORK.map((w) => `${w.nm}|${w.tag}|${w.slot}`)).toEqual([
      "StudioSync|Platform|work-studiosync",
      "Bayobab Client Portal|Frontend|work-bayobab",
      "e-Teller|Fintech|work-eteller",
      "GE Smallworld GIS|GIS|work-gis",
    ]);
  });
});
describe("XP", () => {
  it("marks MTN and Accenture as ongoing (now=true)", () => {
    expect(XP[0].now).toBe(true);
    expect(XP[1].now).toBe(true);
    expect(XP[2].now).toBeUndefined();
    expect(XP[3].now).toBeUndefined();
  });
});
