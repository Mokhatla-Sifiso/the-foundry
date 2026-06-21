import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/lib/theme-preference";

export function ThemeBootstrapScript(): React.ReactElement {
  const source = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
    THEME_STORAGE_KEY,
  )});if(t==="light"||t==="dark"){document.documentElement.setAttribute(${JSON.stringify(
    THEME_ATTRIBUTE,
  )},t);}}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: source }} />;
}
