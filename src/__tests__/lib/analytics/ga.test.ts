import {
  GA_MEASUREMENT_ID,
  clearGaCookies,
  gaPageView,
  isGaConfigured,
  isValidGaId,
  setGaDisabled,
} from "@/lib/analytics/ga";

describe("isValidGaId", () => {
  it("accepts well-formed GA4 measurement ids", () => {
    expect(isValidGaId("G-ABC123XYZ")).toBe(true);
    expect(isValidGaId("G-1234567890")).toBe(true);
    expect(isValidGaId("g-abcd12")).toBe(true);
  });
  it("rejects empty, Universal Analytics, or GTM ids", () => {
    expect(isValidGaId("")).toBe(false);
    expect(isValidGaId("G-")).toBe(false);
    expect(isValidGaId("UA-12345-1")).toBe(false);
    expect(isValidGaId("GTM-ABCDE")).toBe(false);
    expect(isValidGaId("not-an-id")).toBe(false);
  });
});

describe("isGaConfigured", () => {
  it("matches validity of the build-time measurement id (unset in tests)", () => {
    expect(isGaConfigured()).toBe(isValidGaId(GA_MEASUREMENT_ID));
    expect(isGaConfigured()).toBe(false);
  });
});

describe("gaPageView", () => {
  afterEach(() => {
    delete window.gtag;
  });
  it("no-ops when gtag is not present", () => {
    delete window.gtag;
    expect(() => gaPageView("/anywhere")).not.toThrow();
  });
  it("sends a page_view event when gtag is present", () => {
    const spy = jest.fn();
    window.gtag = spy;
    gaPageView("/about");
    expect(spy).toHaveBeenCalledWith(
      "event",
      "page_view",
      expect.objectContaining({ page_path: "/about" }),
    );
  });
});

describe("setGaDisabled", () => {
  it("toggles the gtag opt-out flag for the given id", () => {
    setGaDisabled(true, "G-OPTOUT99");
    expect((window as unknown as Record<string, boolean>)["ga-disable-G-OPTOUT99"]).toBe(true);
    setGaDisabled(false, "G-OPTOUT99");
    expect((window as unknown as Record<string, boolean>)["ga-disable-G-OPTOUT99"]).toBe(false);
  });
  it("no-ops for an empty id", () => {
    expect(() => setGaDisabled(true, "")).not.toThrow();
  });
});

describe("clearGaCookies", () => {
  it("expires _ga and _ga_* cookies while leaving others alone", () => {
    document.cookie = "_ga=GA1.1.123456; Path=/";
    document.cookie = "_ga_ABC123=session; Path=/";
    document.cookie = "keep_me=1; Path=/";
    clearGaCookies();
    expect(document.cookie).not.toContain("_ga=");
    expect(document.cookie).not.toContain("_ga_ABC123=");
    expect(document.cookie).toContain("keep_me=1");
  });
});
