const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FREE_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "yandex.com",
  "zoho.com",
  "pm.me",
  "hey.com",
  "ymail.com",
]);
export type SignupPayload = Readonly<{
  email: string;
  name: string;
  company: string;
  role: string;
  url: string;
  acceptedTerms: true;
  acceptedPrivacy: true;
}>;
export type ValidationError = Readonly<{
  field: keyof SignupPayload | "consent";
  message: string;
}>;
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}
export function isFreeDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return FREE_DOMAINS.has(domain);
}
export function validateSignup(
  raw: unknown,
  options: {
    isAdmin: boolean;
  },
):
  | {
      ok: true;
      value: SignupPayload;
    }
  | {
      ok: false;
      error: ValidationError;
    } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: { field: "email", message: "Invalid request." } };
  }
  const input = raw as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const company = typeof input.company === "string" ? input.company.trim() : "";
  const role = typeof input.role === "string" ? input.role.trim() : "";
  const url = typeof input.url === "string" ? input.url.trim() : "";
  const acceptedTerms = input.acceptedTerms === true;
  const acceptedPrivacy = input.acceptedPrivacy === true;
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: { field: "email", message: "Enter a valid email address." } };
  }
  if (!options.isAdmin && isFreeDomain(email)) {
    return {
      ok: false,
      error: {
        field: "email",
        message:
          "Please use your work email, personal inboxes (gmail, outlook…) can't be verified.",
      },
    };
  }
  if (name.length < 2)
    return { ok: false, error: { field: "name", message: "Please enter your full name." } };
  if (company.length < 2)
    return { ok: false, error: { field: "company", message: "Which company are you with?" } };
  if (role.length < 2)
    return { ok: false, error: { field: "role", message: "What role are you hiring for?" } };
  if (url.length < 4)
    return {
      ok: false,
      error: { field: "url", message: "Company website or LinkedIn helps verify you." },
    };
  if (!acceptedTerms || !acceptedPrivacy) {
    return {
      ok: false,
      error: {
        field: "consent",
        message: "You must accept the Recruiter Terms and Privacy Policy to continue.",
      },
    };
  }
  return {
    ok: true,
    value: {
      email: normalizeEmail(email),
      name,
      company,
      role,
      url,
      acceptedTerms: true,
      acceptedPrivacy: true,
    },
  };
}
