import { RATE_LIMITED, SERVER_ERROR } from "./messages";
import { parseToken } from "./validation";

/** What the confirm and unsubscribe pages show (spec UG FR-UG-06, FR-UG-07), from the boards. */
export interface StatusView {
  title: string;
  body: string;
  icon: "mail" | "check" | "alert";
  /** An outlined status mark rather than a filled one, for the states that are not a success. */
  muted: boolean;
  /** One of the dialog's approved failure lines, shown above the action. */
  alert?: string;
  action: StatusAction;
}

export type StatusAction =
  | Readonly<{
      kind: "form";
      endpoint: string;
      token: string;
      label: string;
      icon: "check" | "close";
    }>
  | Readonly<{
      kind: "link";
      href: string;
      label: string;
      icon: "arrow" | "bell";
      primary: boolean;
    }>;

type Params = Readonly<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const BACK: StatusAction = {
  kind: "link",
  href: "/",
  label: "Back to the site",
  icon: "arrow",
  primary: false,
};
/** The gate itself, since the home page shows the old site once a visitor has clicked through. */
const SIGN_UP_AGAIN: StatusAction = {
  kind: "link",
  href: "/upgrades",
  label: "Sign up again",
  icon: "bell",
  primary: true,
};

function retryAlert(status: string | undefined): string | undefined {
  if (status === "limited") return RATE_LIMITED;
  if (status === "error") return SERVER_ERROR;
  return undefined;
}

/** The confirm page for the query string the email link or the confirm route left. */
export function confirmView(params: Params): StatusView {
  const status = first(params.status);
  const token = parseToken(first(params.token));
  if (status === "confirmed") {
    return {
      icon: "check",
      muted: false,
      title: "You're on the list",
      body: "You'll get one email when the new version is live. It has an unsubscribe link, and your address is deleted once it's sent.",
      action: BACK,
    };
  }
  if (status === "expired") {
    return {
      icon: "alert",
      muted: true,
      title: "This link has expired",
      body: "Confirmation links last 48 hours. Sign up again and I'll send a fresh one.",
      action: SIGN_UP_AGAIN,
    };
  }
  if (status === "invalid" || !token) {
    return {
      icon: "alert",
      muted: true,
      title: "This link doesn't work",
      body: "It may have been used already, or copied only in part. Sign up again to get a new one.",
      action: SIGN_UP_AGAIN,
    };
  }
  return {
    icon: "mail",
    muted: false,
    title: "Confirm your email",
    body: "Confirm, and I'll email you once when the new version of this portfolio is live.",
    alert: retryAlert(status),
    action: {
      kind: "form",
      endpoint: "/api/updates/confirm",
      token,
      label: "Confirm",
      icon: "check",
    },
  };
}

/** The unsubscribe page for the query string the email link or the unsubscribe route left. */
export function unsubscribeView(params: Params): StatusView {
  const status = first(params.status);
  const token = parseToken(first(params.token));
  if (status === "removed") {
    return {
      icon: "check",
      muted: false,
      title: "You're unsubscribed",
      body: "Your address has been deleted. You won't get the launch email.",
      action: BACK,
    };
  }
  if (status === "invalid" || !token) {
    return {
      icon: "alert",
      muted: true,
      title: "This link doesn't work",
      body: "Your address may already have been removed. Nothing else is needed.",
      action: BACK,
    };
  }
  return {
    icon: "mail",
    muted: true,
    title: "Stop the launch email?",
    body: "Your address is deleted straight away and isn't used again.",
    alert: retryAlert(status),
    action: {
      kind: "form",
      endpoint: "/api/updates/unsubscribe",
      token,
      label: "Unsubscribe",
      icon: "close",
    },
  };
}
