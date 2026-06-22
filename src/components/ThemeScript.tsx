export function ThemeScript(): React.ReactElement {
  const js =
    "(()=>{try{var t=localStorage.getItem('studio-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})()";
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
