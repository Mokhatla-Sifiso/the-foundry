import {
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  ThemePreference,
} from "@/lib/theme-preference";

describe("ThemePreference", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  });

  describe("read", () => {
    it("returns the persisted theme when one is stored", () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
      expect(ThemePreference.read()).toBe("dark");
    });

    it("falls back to the supplied default when storage is empty and no system preference is available", () => {
      const matchMedia = window.matchMedia;
      window.matchMedia = (query: string) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList;

      expect(ThemePreference.read("light")).toBe("light");
      window.matchMedia = matchMedia;
    });

    it("ignores a corrupted stored value", () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, "neon");
      // With a 'matches: false' matchMedia stub, the resolved system preference
      // is 'light', so a corrupt stored value should fall through to that.
      expect(ThemePreference.read("light")).toBe("light");
    });
  });

  describe("write", () => {
    it("persists the theme to localStorage", () => {
      ThemePreference.write("dark");
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    });
  });

  describe("apply", () => {
    it("sets the data-theme attribute on <html>", () => {
      ThemePreference.apply("dark");
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
    });
  });

  describe("toggle", () => {
    it("flips light to dark and back", () => {
      expect(ThemePreference.toggle("light")).toBe("dark");
      expect(ThemePreference.toggle("dark")).toBe("light");
    });
  });

  describe("systemPreference", () => {
    it("returns light when prefers-color-scheme matches light", () => {
      const original = window.matchMedia;
      window.matchMedia = (query: string) =>
        ({
          matches: false, // prefers-color-scheme: dark → false ⇒ system is light
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList;

      expect(ThemePreference.systemPreference()).toBe("light");
      window.matchMedia = original;
    });

    it("returns dark when prefers-color-scheme: dark matches", () => {
      const original = window.matchMedia;
      window.matchMedia = (query: string) =>
        ({
          matches: query.includes("dark"),
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList;

      expect(ThemePreference.systemPreference()).toBe("dark");
      window.matchMedia = original;
    });
  });
});
