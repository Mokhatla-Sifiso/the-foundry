/**
 * No-flash theme bootstrap — VERBATIM from §5.2. Inline `<script>`
 * that reads `localStorage['studio-theme']` and applies `data-theme`
 * to <html> before paint. Lives in <head> in `layout.tsx`.
 */
export function ThemeScript(): React.ReactElement {
  const js =
    "(()=>{try{var t=localStorage.getItem('studio-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})()";
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
