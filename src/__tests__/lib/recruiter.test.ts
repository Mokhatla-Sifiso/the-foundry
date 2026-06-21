import {
  domainOf,
  emailRe,
  FREE,
  genCode,
  isFree,
  loadAccounts,
  LS_ACCOUNTS,
  LS_SESSION,
  saveAccounts,
} from "@/lib/recruiter";

describe("FREE domain set", () => {
  it("contains the canonical personal-inbox providers", () => {
    expect(FREE.has("gmail.com")).toBe(true);
    expect(FREE.has("outlook.com")).toBe(true);
    expect(FREE.has("icloud.com")).toBe(true);
    expect(FREE.has("proton.me")).toBe(true);
  });

  it("does not contain corporate-looking domains", () => {
    expect(FREE.has("anthropic.com")).toBe(false);
    expect(FREE.has("mtn.com")).toBe(false);
  });
});

describe("emailRe", () => {
  it.each([
    ["a@b.co", true],
    ["jordan.pillay@acme.co.uk", true],
    ["no-at", false],
    ["@nothing.com", false],
    ["space @x.co", false],
  ])("%s → %s", (input, want) => {
    expect(emailRe.test(input)).toBe(want);
  });
});

describe("domainOf", () => {
  it("returns the lowercased trimmed domain part", () => {
    expect(domainOf("Jordan@Acme.CO")).toBe("acme.co");
    expect(domainOf("   x@Foo.com ")).toBe("foo.com");
  });

  it("returns empty string when there's no @", () => {
    expect(domainOf("nope")).toBe("");
  });
});

describe("isFree", () => {
  it("flags personal inboxes", () => {
    expect(isFree("me@gmail.com")).toBe(true);
    expect(isFree("Me@OUTLOOK.com")).toBe(true);
  });

  it("approves work domains", () => {
    expect(isFree("me@acme.co")).toBe(false);
  });
});

describe("genCode", () => {
  it("always produces a 6-digit numeric string", () => {
    for (let i = 0; i < 50; i += 1) {
      const code = genCode();
      expect(code).toMatch(/^\d{6}$/);
    }
  });
});

describe("loadAccounts / saveAccounts", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns {} when storage is empty", () => {
    expect(loadAccounts()).toEqual({});
  });

  it("round-trips a saved account map", () => {
    const accounts = {
      "jordan@acme.co": {
        name: "Jordan",
        email: "jordan@acme.co",
        company: "Acme",
        role: "Frontend Engineer",
        url: "acme.co",
        verifiedAt: 123,
      },
    };
    saveAccounts(accounts);
    expect(window.localStorage.getItem(LS_ACCOUNTS)).toContain("jordan@acme.co");
    expect(loadAccounts()).toEqual(accounts);
  });

  it("returns {} when storage holds corrupt JSON", () => {
    window.localStorage.setItem(LS_ACCOUNTS, "{not-json");
    expect(loadAccounts()).toEqual({});
  });

  it("exposes the LS_SESSION key constant for callers", () => {
    expect(LS_SESSION).toBe("recruiter-session-v1");
  });
});
