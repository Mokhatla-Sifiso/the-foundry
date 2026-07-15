import {
  ACCEPT_ALL,
  CONSENT_COOKIE,
  CONSENT_COOKIE_MAX_AGE,
  DEFAULT_REJECTED,
  isGranted,
  parseConsent,
  serializeConsent,
  type ConsentChoices,
  type ConsentRecord,
} from "@/lib/privacy/consent";
import { COOKIE_POLICY_VERSION } from "@/lib/privacy/policy";

describe("consent constants", () => {
  it("exposes the cookie name and a 12-month max age", () => {
    expect(CONSENT_COOKIE).toBe("consent");
    expect(CONSENT_COOKIE_MAX_AGE).toBe(60 * 60 * 24 * 365);
  });
  it("DEFAULT_REJECTED keeps only necessary cookies", () => {
    expect(DEFAULT_REJECTED).toEqual({
      necessary: true,
      functional: false,
      analytics: false,
    });
  });
  it("ACCEPT_ALL enables every category", () => {
    expect(ACCEPT_ALL).toEqual({
      necessary: true,
      functional: true,
      analytics: true,
    });
  });
});

describe("parseConsent — invalid input", () => {
  it("returns null for undefined", () => {
    expect(parseConsent(undefined)).toBeNull();
  });
  it("returns null for null", () => {
    expect(parseConsent(null)).toBeNull();
  });
  it("returns null for an empty string", () => {
    expect(parseConsent("")).toBeNull();
  });
  it("returns null for garbage that is not JSON", () => {
    expect(parseConsent("{not-json")).toBeNull();
  });
  it("returns null when the policy version does not match", () => {
    const raw = encodeURIComponent(
      JSON.stringify({ v: "0000-old.v0", ts: Date.now(), choices: ACCEPT_ALL }),
    );
    expect(parseConsent(raw)).toBeNull();
  });
  it("returns null when the version field is missing", () => {
    const raw = encodeURIComponent(JSON.stringify({ ts: Date.now(), choices: ACCEPT_ALL }));
    expect(parseConsent(raw)).toBeNull();
  });
  it("returns null when ts is not a number", () => {
    const raw = encodeURIComponent(
      JSON.stringify({ v: COOKIE_POLICY_VERSION, ts: "nope", choices: ACCEPT_ALL }),
    );
    expect(parseConsent(raw)).toBeNull();
  });
  it("returns null when choices is missing", () => {
    const raw = encodeURIComponent(
      JSON.stringify({ v: COOKIE_POLICY_VERSION, ts: Date.now() }),
    );
    expect(parseConsent(raw)).toBeNull();
  });
  it("returns null when choices is null", () => {
    const raw = encodeURIComponent(
      JSON.stringify({ v: COOKIE_POLICY_VERSION, ts: Date.now(), choices: null }),
    );
    expect(parseConsent(raw)).toBeNull();
  });
  it("returns null when choices is not an object", () => {
    const raw = encodeURIComponent(
      JSON.stringify({ v: COOKIE_POLICY_VERSION, ts: Date.now(), choices: "all" }),
    );
    expect(parseConsent(raw)).toBeNull();
  });
});

describe("parseConsent — valid input", () => {
  it("parses a well-formed record and forces necessary to true", () => {
    const ts = 1_700_000_000_000;
    const raw = encodeURIComponent(
      JSON.stringify({
        v: COOKIE_POLICY_VERSION,
        ts,
        choices: { necessary: true, functional: true, analytics: false },
      }),
    );
    expect(parseConsent(raw)).toEqual({
      v: COOKIE_POLICY_VERSION,
      ts,
      choices: { necessary: true, functional: true, analytics: false },
    });
  });
  it("coerces truthy/falsy choice values through Boolean()", () => {
    const raw = encodeURIComponent(
      JSON.stringify({
        v: COOKIE_POLICY_VERSION,
        ts: 1,
        choices: { functional: 1, analytics: 0 },
      }),
    );
    const parsed = parseConsent(raw);
    expect(parsed?.choices).toEqual({
      necessary: true,
      functional: true,
      analytics: false,
    });
  });
  it("forces necessary to true even when the cookie says false", () => {
    const raw = encodeURIComponent(
      JSON.stringify({
        v: COOKIE_POLICY_VERSION,
        ts: 1,
        choices: { necessary: false, functional: false, analytics: true },
      }),
    );
    const parsed = parseConsent(raw);
    expect(parsed?.choices.necessary).toBe(true);
    expect(parsed?.choices.analytics).toBe(true);
  });
  it("defaults omitted choice flags to false", () => {
    const raw = encodeURIComponent(
      JSON.stringify({ v: COOKIE_POLICY_VERSION, ts: 1, choices: {} }),
    );
    const parsed = parseConsent(raw);
    expect(parsed?.choices).toEqual({
      necessary: true,
      functional: false,
      analytics: false,
    });
  });
});

describe("serializeConsent", () => {
  it("produces a URL-encoded record carrying the current policy version", () => {
    const encoded = serializeConsent(ACCEPT_ALL);
    const decoded = JSON.parse(decodeURIComponent(encoded));
    expect(decoded.v).toBe(COOKIE_POLICY_VERSION);
    expect(typeof decoded.ts).toBe("number");
    expect(decoded.choices).toEqual(ACCEPT_ALL);
  });
  it("round-trips serialize -> parse for ACCEPT_ALL", () => {
    const parsed = parseConsent(serializeConsent(ACCEPT_ALL));
    expect(parsed?.choices).toEqual(ACCEPT_ALL);
    expect(parsed?.v).toBe(COOKIE_POLICY_VERSION);
  });
  it("round-trips serialize -> parse for DEFAULT_REJECTED", () => {
    const parsed = parseConsent(serializeConsent(DEFAULT_REJECTED));
    expect(parsed?.choices).toEqual(DEFAULT_REJECTED);
  });
  it("stamps ts from Date.now()", () => {
    const spy = jest.spyOn(Date, "now").mockReturnValue(42);
    try {
      const decoded = JSON.parse(decodeURIComponent(serializeConsent(DEFAULT_REJECTED)));
      expect(decoded.ts).toBe(42);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("isGranted", () => {
  const record: ConsentRecord = {
    v: COOKIE_POLICY_VERSION,
    ts: 1,
    choices: { necessary: true, functional: true, analytics: false },
  };
  it("always grants the necessary category, even with a null record", () => {
    expect(isGranted(null, "necessary")).toBe(true);
    expect(isGranted(record, "necessary")).toBe(true);
  });
  it("denies non-necessary categories when the record is null", () => {
    expect(isGranted(null, "functional")).toBe(false);
    expect(isGranted(null, "analytics")).toBe(false);
  });
  it("grants a category the record enabled", () => {
    expect(isGranted(record, "functional")).toBe(true);
  });
  it("denies a category the record disabled", () => {
    expect(isGranted(record, "analytics")).toBe(false);
  });
  it("denies when the choice value is not strictly true", () => {
    const loose = {
      v: COOKIE_POLICY_VERSION,
      ts: 1,
      choices: { necessary: true, functional: false, analytics: false },
    } as unknown as ConsentRecord;
    const choices = loose.choices as unknown as ConsentChoices;
    void choices;
    expect(isGranted(loose, "functional")).toBe(false);
  });
});
