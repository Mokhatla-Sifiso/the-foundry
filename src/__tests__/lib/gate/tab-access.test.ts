import { restoreTabAccess, tabAccess, tabAccessScript } from "@/lib/gate/tab-access";

const NAME = "site-access";
const VALUE = "v2";
const ACTION = "/api/site-access";

function clearCookie(): void {
  document.cookie = `${NAME}=;Path=/;Max-Age=0`;
}

function holdsCookie(): boolean {
  return document.cookie.split("; ").includes(`${NAME}=${VALUE}`);
}

function run(gated: boolean, listen = false): boolean {
  return tabAccess(gated, listen, NAME, VALUE, ACTION);
}

describe("tabAccess", () => {
  beforeEach(() => {
    clearCookie();
    sessionStorage.clear();
  });

  it("sends a new tab back to the gate when another tab made the choice", () => {
    document.cookie = `${NAME}=${VALUE};Path=/`;
    expect(run(false)).toBe(true);
    expect(holdsCookie()).toBe(false);
  });

  it("leaves the tab that made the choice on the site", () => {
    document.cookie = `${NAME}=${VALUE};Path=/`;
    sessionStorage.setItem(NAME, VALUE);
    expect(run(false)).toBe(false);
    expect(holdsCookie()).toBe(true);
  });

  it("restores access on the gate in the tab that made the choice, after another tab cleared it", () => {
    sessionStorage.setItem(NAME, VALUE);
    expect(run(true)).toBe(true);
    expect(holdsCookie()).toBe(true);
  });

  it("does not reload a page that is not the gate when the cookie is missing", () => {
    sessionStorage.setItem(NAME, VALUE);
    expect(run(false)).toBe(false);
    expect(holdsCookie()).toBe(false);
  });

  it("does nothing for a visitor who has not chosen", () => {
    expect(run(true)).toBe(false);
    expect(run(false)).toBe(false);
    expect(holdsCookie()).toBe(false);
  });

  it("ignores an older cookie version", () => {
    document.cookie = `${NAME}=v0;Path=/`;
    expect(run(false)).toBe(false);
  });

  it("marks the tab when the gate's form is submitted", () => {
    run(true, true);
    const form = document.createElement("form");
    form.setAttribute("action", ACTION);
    form.addEventListener("submit", (event) => event.preventDefault());
    document.body.append(form);
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(sessionStorage.getItem(NAME)).toBe(VALUE);
    form.remove();
  });

  it("does not mark the tab for any other form", () => {
    run(true, true);
    const form = document.createElement("form");
    form.setAttribute("action", "/api/contact");
    form.addEventListener("submit", (event) => event.preventDefault());
    document.body.append(form);
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(sessionStorage.getItem(NAME)).toBeNull();
    form.remove();
  });

  it("fails closed when storage is unavailable", () => {
    const spy = jest.spyOn(window, "sessionStorage", "get").mockImplementation(() => {
      throw new Error("blocked");
    });
    document.cookie = `${NAME}=${VALUE};Path=/`;
    expect(run(false)).toBe(false);
    spy.mockRestore();
  });

  it("restoreTabAccess uses the gate's cookie and does not listen", () => {
    sessionStorage.setItem(NAME, VALUE);
    expect(restoreTabAccess()).toBe(true);
    expect(holdsCookie()).toBe(true);
  });
});

describe("tabAccessScript", () => {
  it("calls the check with the gate state and the site's cookie, then reloads when told to", () => {
    const script = tabAccessScript(true);
    expect(script.startsWith("(")).toBe(true);
    expect(script).toContain(`)(true,true,"${NAME}","${VALUE}","${ACTION}")&&location.reload()`);
    expect(tabAccessScript(false)).toContain(`)(false,true,"${NAME}","${VALUE}","${ACTION}")`);
  });
});
