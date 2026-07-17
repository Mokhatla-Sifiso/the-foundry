import { recruiterBypassAllows } from "@/lib/auth/bypass";

const ORIGINAL_ENV = process.env;
const BEFORE = new Date("2026-07-18T10:00:00Z");
const AFTER = new Date("2026-07-18T15:00:00Z");
const DEADLINE = "2026-07-18T14:21:04Z";

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.RECRUITER_BYPASS_EMAILS = "mokhatla.mzwakhe@gmail.com";
  process.env.RECRUITER_BYPASS_UNTIL = DEADLINE;
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe("recruiterBypassAllows", () => {
  it("lets a listed address through before the deadline", () => {
    expect(recruiterBypassAllows("mokhatla.mzwakhe@gmail.com", BEFORE)).toBe(true);
  });

  it("stops on its own once the deadline passes, even with the env still set", () => {
    expect(recruiterBypassAllows("mokhatla.mzwakhe@gmail.com", AFTER)).toBe(false);
  });

  it("is closed at the exact deadline, not one tick after", () => {
    expect(recruiterBypassAllows("mokhatla.mzwakhe@gmail.com", new Date(DEADLINE))).toBe(false);
  });

  it("never applies to an address that is not listed", () => {
    expect(recruiterBypassAllows("someone.else@gmail.com", BEFORE)).toBe(false);
  });

  it("ignores case and surrounding whitespace on both sides", () => {
    process.env.RECRUITER_BYPASS_EMAILS = " Mokhatla.Mzwakhe@Gmail.com , other@x.co ";
    expect(recruiterBypassAllows("  MOKHATLA.MZWAKHE@gmail.com ", BEFORE)).toBe(true);
    expect(recruiterBypassAllows("other@x.co", BEFORE)).toBe(true);
  });

  it("is off entirely when no deadline is configured", () => {
    delete process.env.RECRUITER_BYPASS_UNTIL;
    expect(recruiterBypassAllows("mokhatla.mzwakhe@gmail.com", BEFORE)).toBe(false);
  });

  it("fails closed on an unparseable deadline rather than staying open", () => {
    process.env.RECRUITER_BYPASS_UNTIL = "next tuesday";
    expect(recruiterBypassAllows("mokhatla.mzwakhe@gmail.com", BEFORE)).toBe(false);
  });

  it("fails closed when the list is empty or missing", () => {
    process.env.RECRUITER_BYPASS_EMAILS = "";
    expect(recruiterBypassAllows("mokhatla.mzwakhe@gmail.com", BEFORE)).toBe(false);
    delete process.env.RECRUITER_BYPASS_EMAILS;
    expect(recruiterBypassAllows("mokhatla.mzwakhe@gmail.com", BEFORE)).toBe(false);
  });

  it("does not treat an empty address as a match against empty list entries", () => {
    process.env.RECRUITER_BYPASS_EMAILS = "a@b.co,,";
    expect(recruiterBypassAllows("", BEFORE)).toBe(false);
    expect(recruiterBypassAllows("   ", BEFORE)).toBe(false);
  });
});
