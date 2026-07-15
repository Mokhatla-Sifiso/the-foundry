export const GUEST_RESOURCES = [
  { key: "cv", label: "CV (PDF)" },
  { key: "repos", label: "Private repositories" },
  { key: "cases", label: "Deeper case studies" },
  { key: "references", label: "References" },
] as const;

export type GuestResourceKey = (typeof GUEST_RESOURCES)[number]["key"];

export const GUEST_RESOURCE_KEYS: ReadonlyArray<string> = GUEST_RESOURCES.map((r) => r.key);

export const GUEST_GRANT_DAYS = 30;

export function resourceLabel(key: string): string {
  return GUEST_RESOURCES.find((r) => r.key === key)?.label ?? key;
}
