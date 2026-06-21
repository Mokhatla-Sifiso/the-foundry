import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/lib/theme-preference";

/**
 * Inline script injected into <head> that reads the persisted theme and
 * applies `data-theme` to <html> before the browser paints — eliminating
 * the flash of light theme when the user has dark stored. Runs synchronously
 * before any other JS, no React involvement.
 *
 * Kept in its own component so the layout file doesn't carry a literal
 * blob of unscanned JS, and so we can swap the implementation later
 * without churning layout.tsx.
 */
export function ThemeBootstrapScript(): React.ReactElement {
  const source = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
    THEME_STORAGE_KEY,
  )});if(t==="light"||t==="dark"){document.documentElement.setAttribute(${JSON.stringify(
    THEME_ATTRIBUTE,
  )},t);}}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: source }} />;
}
