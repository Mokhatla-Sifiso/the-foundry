import { ACCESS_COOKIE, ACCESS_PATH, ACCESS_VALUE } from "./access";

export function tabAccess(
  gated: boolean,
  listen: boolean,
  name: string,
  value: string,
  action: string,
): boolean {
  try {
    const store = window.sessionStorage;
    const attrs = `;Path=/;SameSite=Lax${window.location.protocol === "https:" ? ";Secure" : ""}`;
    if (listen) {
      document.addEventListener(
        "submit",
        (event) => {
          const form = event.target;
          if (!(form instanceof HTMLFormElement)) return;
          const target = new URL(form.getAttribute("action") ?? "", window.location.href);
          if (target.pathname === action) store.setItem(name, value);
        },
        true,
      );
    }
    const held = document.cookie.split("; ").includes(`${name}=${value}`);
    const mine = store.getItem(name) === value;
    if (held && !mine) {
      document.cookie = `${name}=${attrs};Max-Age=0`;
      return true;
    }
    if (!held && mine && gated) {
      document.cookie = `${name}=${value}${attrs}`;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function tabAccessScript(gated: boolean): string {
  const args = [gated, true, ACCESS_COOKIE, ACCESS_VALUE, ACCESS_PATH]
    .map((arg) => JSON.stringify(arg))
    .join(",");
  return `(${tabAccess.toString()})(${args})&&location.reload()`;
}

export function restoreTabAccess(): boolean {
  return tabAccess(true, false, ACCESS_COOKIE, ACCESS_VALUE, ACCESS_PATH);
}

export function reloadPage(): void {
  window.location.reload();
}
