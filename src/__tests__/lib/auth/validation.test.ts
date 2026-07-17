import {
  isFreeDomain,
  normalizeEmail,
  validateSignup,
  type SignupPayload,
} from "@/lib/auth/validation";

describe("normalizeEmail", () => {
  it("trims surrounding whitespace and lowercases", () => {
    expect(normalizeEmail("  Jordan@Acme.CO  ")).toBe("jordan@acme.co");
  });
  it("leaves an already-normalized address untouched", () => {
    expect(normalizeEmail("me@acme.co")).toBe("me@acme.co");
  });
  it("handles an empty string", () => {
    expect(normalizeEmail("")).toBe("");
  });
});

describe("isFreeDomain", () => {
  it.each([
    ["me@gmail.com", true],
    ["me@googlemail.com", true],
    ["Me@OUTLOOK.com", true],
    ["me@icloud.com", true],
    ["me@proton.me", true],
    ["me@pm.me", true],
    ["me@hey.com", true],
  ])("flags personal inbox %s", (email, want) => {
    expect(isFreeDomain(email)).toBe(want);
  });
  it("approves corporate domains", () => {
    expect(isFreeDomain("me@acme.co")).toBe(false);
    expect(isFreeDomain("hire@anthropic.com")).toBe(false);
  });
  it("returns false when there is no domain part", () => {
    expect(isFreeDomain("no-at-sign")).toBe(false);
  });
  it("lowercases the domain before matching", () => {
    expect(isFreeDomain("me@GMAIL.COM")).toBe(true);
  });
});

const goodInput = {
  email: "jordan@acme.co",
  name: "Jordan Pillay",
  company: "Acme",
  role: "Frontend Engineer",
  url: "acme.co",
  acceptedTerms: true,
  acceptedPrivacy: true,
};

describe("validateSignup — success", () => {
  it("accepts a fully valid work-email payload and normalizes the email", () => {
    const result = validateSignup(
      { ...goodInput, email: "  Jordan@Acme.CO  " },
      { allowPersonalEmail: false },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      const value: SignupPayload = result.value;
      expect(value).toEqual({
        email: "jordan@acme.co",
        name: "Jordan Pillay",
        company: "Acme",
        role: "Frontend Engineer",
        url: "acme.co",
        acceptedTerms: true,
        acceptedPrivacy: true,
      });
    }
  });
  it("trims whitespace on every text field", () => {
    const result = validateSignup(
      {
        email: "jordan@acme.co",
        name: "  Jordan  ",
        company: "  Acme  ",
        role: "  Engineer  ",
        url: "  acme.co  ",
        acceptedTerms: true,
        acceptedPrivacy: true,
      },
      { allowPersonalEmail: false },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Jordan");
      expect(result.value.company).toBe("Acme");
      expect(result.value.role).toBe("Engineer");
      expect(result.value.url).toBe("acme.co");
    }
  });
  it("allows a free/personal domain when isAdmin is true", () => {
    const result = validateSignup(
      { ...goodInput, email: "me@gmail.com" },
      { allowPersonalEmail: true },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.email).toBe("me@gmail.com");
    }
  });
});

describe("validateSignup — rejection branches", () => {
  it("rejects a null body", () => {
    const result = validateSignup(null, { allowPersonalEmail: false });
    expect(result).toEqual({
      ok: false,
      error: { field: "email", message: "Invalid request." },
    });
  });
  it("rejects a non-object body", () => {
    const result = validateSignup("not-an-object", { allowPersonalEmail: false });
    expect(result).toEqual({
      ok: false,
      error: { field: "email", message: "Invalid request." },
    });
  });
  it("rejects undefined", () => {
    const result = validateSignup(undefined, { allowPersonalEmail: false });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("email");
  });
  it("rejects an invalid email format", () => {
    const result = validateSignup(
      { ...goodInput, email: "no-at-sign" },
      { allowPersonalEmail: false },
    );
    expect(result).toEqual({
      ok: false,
      error: { field: "email", message: "Enter a valid email address." },
    });
  });
  it("coerces every non-string text field to empty (hitting each ternary fallback)", () => {
    const result = validateSignup(
      {
        email: "jordan@acme.co",
        name: 1,
        company: {},
        role: [],
        url: null,
        acceptedTerms: true,
        acceptedPrivacy: true,
      },
      { allowPersonalEmail: false },
    );
    // email is valid, so it falls through to the first empty text field: name.
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("name");
  });
  it("treats a non-string email as empty and rejects it", () => {
    const result = validateSignup({ ...goodInput, email: 12345 }, { allowPersonalEmail: false });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe("email");
      expect(result.error.message).toBe("Enter a valid email address.");
    }
  });
  it("rejects a free/personal domain when not admin", () => {
    const result = validateSignup(
      { ...goodInput, email: "me@gmail.com" },
      { allowPersonalEmail: false },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe("email");
      expect(result.error.message).toContain("work email");
    }
  });
  it("rejects when name is too short", () => {
    const result = validateSignup({ ...goodInput, name: "J" }, { allowPersonalEmail: false });
    expect(result).toEqual({
      ok: false,
      error: { field: "name", message: "Please enter your full name." },
    });
  });
  it("rejects when company is too short", () => {
    const result = validateSignup({ ...goodInput, company: "A" }, { allowPersonalEmail: false });
    expect(result).toEqual({
      ok: false,
      error: { field: "company", message: "Which company are you with?" },
    });
  });
  it("rejects when role is too short", () => {
    const result = validateSignup({ ...goodInput, role: "X" }, { allowPersonalEmail: false });
    expect(result).toEqual({
      ok: false,
      error: { field: "role", message: "What role are you hiring for?" },
    });
  });
  it("rejects when url is too short", () => {
    const result = validateSignup({ ...goodInput, url: "ab" }, { allowPersonalEmail: false });
    expect(result).toEqual({
      ok: false,
      error: { field: "url", message: "Company website or LinkedIn helps verify you." },
    });
  });
  it("rejects when terms are not accepted", () => {
    const result = validateSignup(
      { ...goodInput, acceptedTerms: false },
      { allowPersonalEmail: false },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe("consent");
      expect(result.error.message).toContain("Recruiter Terms");
    }
  });
  it("rejects when privacy is not accepted", () => {
    const result = validateSignup(
      { ...goodInput, acceptedPrivacy: false },
      { allowPersonalEmail: false },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("consent");
  });
  it("rejects when acceptedTerms is a truthy non-true value (must be strictly true)", () => {
    const result = validateSignup(
      { ...goodInput, acceptedTerms: "yes" },
      { allowPersonalEmail: false },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe("consent");
  });
});
