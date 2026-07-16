export type CookieCategory = "necessary" | "functional" | "analytics";
export type CookieEntry = Readonly<{
  name: string;
  storage: "cookie" | "localStorage";
  category: CookieCategory;
  party: "first" | "third";
  purpose: string;
  duration: string;
}>;
export const COOKIE_INVENTORY: readonly CookieEntry[] = [
  {
    name: "better-auth.session_token",
    storage: "cookie",
    category: "necessary",
    party: "first",
    purpose:
      "Identifies your authenticated session after sign-in so you don't have to verify your email on every request.",
    duration: "14 days",
  },
  {
    name: "better-auth.session_data",
    storage: "cookie",
    category: "necessary",
    party: "first",
    purpose:
      "Short-lived cache of your session so pages can render without an extra database lookup.",
    duration: "5 minutes",
  },
  {
    name: "consent",
    storage: "cookie",
    category: "necessary",
    party: "first",
    purpose: "Records your cookie preferences so we don't ask you again on every visit.",
    duration: "12 months",
  },
  {
    name: "studio-theme",
    storage: "localStorage",
    category: "functional",
    party: "first",
    purpose: "Remembers whether you chose light or dark mode.",
    duration: "Until you clear browser storage",
  },
  {
    name: "_ga",
    storage: "cookie",
    category: "analytics",
    party: "third",
    purpose:
      "Google Analytics uses this to tell one visitor apart from another so I can see how many people visit and which pages get read. Only set if you allow analytics.",
    duration: "2 years",
  },
  {
    name: "_ga_<container>",
    storage: "cookie",
    category: "analytics",
    party: "third",
    purpose:
      "Google Analytics uses this to keep your current session together so a single visit isn't counted twice. Only set if you allow analytics.",
    duration: "2 years",
  },
] as const;
export const CATEGORY_META: Readonly<
  Record<
    CookieCategory,
    Readonly<{
      label: string;
      description: string;
      alwaysOn: boolean;
    }>
  >
> = {
  necessary: {
    label: "Strictly necessary",
    description:
      "Required to authenticate you and remember your consent choices. Without these, the recruiter access flow cannot function.",
    alwaysOn: true,
  },
  functional: {
    label: "Functional",
    description: "Remembers preferences like your theme so the site stays personal across visits.",
    alwaysOn: false,
  },
  analytics: {
    label: "Analytics",
    description:
      "Loads Google Analytics so I can see aggregate visits and which pages are useful. Nothing loads and no analytics cookies are set unless you turn this on.",
    alwaysOn: false,
  },
};
export const CATEGORY_ORDER: readonly CookieCategory[] = [
  "necessary",
  "functional",
  "analytics",
] as const;
export function inventoryByCategory(category: CookieCategory): readonly CookieEntry[] {
  return COOKIE_INVENTORY.filter((c) => c.category === category);
}
