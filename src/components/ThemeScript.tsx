type Props = Readonly<{ nonce?: string }>;

export function ThemeScript({ nonce }: Props): React.ReactElement {
  const js =
    "(()=>{try{var t=localStorage.getItem('studio-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})()";
  return <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: js }} />;
}
