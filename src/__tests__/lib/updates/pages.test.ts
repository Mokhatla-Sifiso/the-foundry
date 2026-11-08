import { RATE_LIMITED, SERVER_ERROR } from "@/lib/updates/messages";
import { confirmView, unsubscribeView } from "@/lib/updates/pages";

const TOKEN = "A".repeat(43);

describe("confirmView", () => {
  it("offers the Confirm button for a well-formed token", () => {
    expect(confirmView({ token: TOKEN })).toMatchObject({
      title: "Confirm your email",
      muted: false,
      alert: undefined,
      action: { kind: "form", endpoint: "/api/updates/confirm", token: TOKEN, label: "Confirm" },
    });
  });

  it.each([
    ["limited", RATE_LIMITED],
    ["error", SERVER_ERROR],
  ])("offers Confirm again with the approved line after %s", (status, alert) => {
    expect(confirmView({ status, token: TOKEN })).toMatchObject({
      title: "Confirm your email",
      alert,
      action: { kind: "form", token: TOKEN },
    });
  });

  it("shows the confirmation, with the way back to the site", () => {
    expect(confirmView({ status: "confirmed" })).toMatchObject({
      title: "You're on the list",
      icon: "check",
      action: { kind: "link", href: "/", label: "Back to the site" },
    });
  });

  it("explains an expired link and offers a fresh sign-up on the gate", () => {
    expect(confirmView({ status: "expired" })).toMatchObject({
      title: "This link has expired",
      muted: true,
      action: { kind: "link", href: "/upgrades", label: "Sign up again" },
    });
  });

  it.each([
    { status: "invalid" },
    {},
    { token: "short" },
    { status: "limited" },
    { token: [TOKEN.slice(1), TOKEN] },
  ])("treats %p as a link that does not work", (params) => {
    expect(confirmView(params)).toMatchObject({
      title: "This link doesn't work",
      action: { href: "/upgrades" },
    });
  });

  it("reads the first value when a parameter repeats", () => {
    expect(confirmView({ status: ["confirmed", "expired"] }).title).toBe("You're on the list");
  });
});

describe("unsubscribeView", () => {
  it("asks before unsubscribing a well-formed token", () => {
    expect(unsubscribeView({ token: TOKEN })).toMatchObject({
      title: "Stop the launch email?",
      action: { kind: "form", endpoint: "/api/updates/unsubscribe", label: "Unsubscribe" },
    });
  });

  it("offers Unsubscribe again with the approved line after an error", () => {
    expect(unsubscribeView({ status: "error", token: TOKEN })).toMatchObject({
      alert: SERVER_ERROR,
      action: { kind: "form", token: TOKEN },
    });
  });

  it("confirms the removal", () => {
    expect(unsubscribeView({ status: "removed" })).toMatchObject({
      title: "You're unsubscribed",
      action: { href: "/", label: "Back to the site" },
    });
  });

  it.each([{ status: "invalid" }, {}, { token: "short" }])(
    "reassures for a link that does not work: %p",
    (params) => {
      expect(unsubscribeView(params)).toMatchObject({
        title: "This link doesn't work",
        body: "Your address may already have been removed. Nothing else is needed.",
        action: { href: "/" },
      });
    },
  );
});
