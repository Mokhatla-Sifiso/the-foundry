import { MAX_EMAIL_LENGTH, parseSubscribe } from "@/lib/updates/validation";

describe("parseSubscribe", () => {
  it("accepts a valid address with consent, normalised to lowercase", () => {
    expect(parseSubscribe({ email: "  Name@Company.COM ", consent: true })).toEqual({
      ok: true,
      email: "name@company.com",
    });
  });

  it("treats a filled honeypot as a bot, before checking anything else", () => {
    expect(parseSubscribe({ website: "https://spam.example", email: "nope" })).toEqual({
      ok: true,
      bot: true,
    });
  });

  it("ignores an empty or whitespace honeypot", () => {
    expect(parseSubscribe({ website: "  ", email: "a@b.co", consent: true })).toEqual({
      ok: true,
      email: "a@b.co",
    });
  });

  it.each([undefined, "", "name", "name@company", "name @company.com", 42])(
    "rejects the email %p",
    (email) => {
      expect(parseSubscribe({ email, consent: true })).toEqual({
        ok: false,
        field: "email",
        message: "Enter an email address like name@company.com.",
      });
    },
  );

  it("rejects addresses longer than the deliverable limit", () => {
    const local = "a".repeat(MAX_EMAIL_LENGTH);
    const result = parseSubscribe({ email: `${local}@b.co`, consent: true });
    expect(result).toMatchObject({ ok: false, field: "email" });
  });

  it.each([undefined, false, "true", 1])(
    "requires consent to be exactly true, not %p",
    (consent) => {
      expect(parseSubscribe({ email: "a@b.co", consent })).toEqual({
        ok: false,
        field: "consent",
        message: "Tick the box so I can send you the launch email.",
      });
    },
  );

  it("handles a body that is not an object", () => {
    expect(parseSubscribe(null)).toMatchObject({ ok: false, field: "email" });
    expect(parseSubscribe("email=a@b.co")).toMatchObject({ ok: false, field: "email" });
  });
});
