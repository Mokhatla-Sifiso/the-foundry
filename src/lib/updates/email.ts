import { Resend } from "resend";
import { SITE_URL } from "@/lib/site-url";

const FROM = process.env.RESEND_FROM ?? "Mzwakhe Mokhatla <noreply@example.com>";

let resend: Resend | null | undefined;
function client(): Resend | null {
  if (resend !== undefined) return resend;
  const key = process.env.RESEND_API_KEY;
  resend = key ? new Resend(key) : null;
  return resend;
}

export type RenderedEmail = Readonly<{ subject: string; html: string; text: string }>;

export type LinkSet = Readonly<{
  confirmUrl: string;
  unsubscribeUrl: string;
  /** RFC 8058 one-click endpoint, for the List-Unsubscribe header. */
  oneClickUrl: string;
}>;

export function linksFor(confirmToken: string, unsubscribeToken: string): LinkSet {
  return {
    confirmUrl: `${SITE_URL}/updates/confirm?token=${confirmToken}`,
    unsubscribeUrl: `${SITE_URL}/updates/unsubscribe?token=${unsubscribeToken}`,
    oneClickUrl: `${SITE_URL}/api/updates/unsubscribe?token=${unsubscribeToken}`,
  };
}

/**
 * The approved confirmation email (design board F): a 560px card in table layout with inline
 * styles, a bulletproof button, and a dark variant for clients that honour prefers-color-scheme.
 */
export function renderConfirmation(links: LinkSet): RenderedEmail {
  const subject = "Confirm your email";
  const body =
    "You asked to hear when the new version of my portfolio is live. Confirm, and you'll get one email, then your address is deleted.";
  const note =
    "This link expires in 48 hours. If you didn't ask for this, ignore this email and nothing happens.";
  const footer =
    "Sent by Mzwakhe Mokhatla, Pretoria, South Africa, because this address asked to be told when the new portfolio is live.";
  const font = "Helvetica,Arial,sans-serif";
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<style>@media (prefers-color-scheme: dark){.bg{background:#08080a!important}.card{background:#111113!important}.ink{color:#fafafa!important}.soft{color:#b9bbbf!important}.muted,.muted a{color:#97999e!important}.btn{background:#fafafa!important}.btn a{color:#08080a!important}}</style></head>
<body class="bg" style="margin:0;background:#f4f4f5">
<div style="display:none;max-height:0;overflow:hidden">One click and you're on the list.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg" style="background:#f4f4f5"><tr><td align="center" style="padding:36px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" class="card" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px">
<tr><td class="ink" style="padding:36px 40px 8px;font:800 22px/1 ${font};letter-spacing:-0.5px;color:#08080a">mzwakhe<span style="color:#b2d5e5">.</span></td></tr>
<tr><td class="ink" style="padding:20px 40px 0;font:700 24px/30px ${font};color:#08080a">${subject}</td></tr>
<tr><td class="soft" style="padding:12px 40px 0;font:400 16px/25px ${font};color:#404145">${body}</td></tr>
<tr><td style="padding:28px 40px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td class="btn" style="border-radius:999px;background:#08080a"><a href="${links.confirmUrl}" style="display:inline-block;padding:14px 26px;font:600 15px/20px ${font};color:#ffffff;text-decoration:none;border-radius:999px">Confirm email</a></td></tr></table></td></tr>
<tr><td class="muted" style="padding:24px 40px 36px;font:400 13px/20px ${font};color:#6e7075">${note}</td></tr>
</table>
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%"><tr><td class="muted" style="padding:20px 40px 0;font:400 12px/19px ${font};color:#6e7075">${footer}<br>
<a href="${links.unsubscribeUrl}" style="color:#6e7075;text-decoration:underline">Unsubscribe</a> &nbsp;&middot;&nbsp; <a href="${SITE_URL}/legal/privacy" style="color:#6e7075;text-decoration:underline">Privacy policy</a></td></tr></table>
</td></tr></table></body></html>`;
  const text = [
    subject,
    "",
    body,
    "",
    `Confirm: ${links.confirmUrl}`,
    "",
    note,
    "",
    footer,
    `Unsubscribe: ${links.unsubscribeUrl}`,
    `Privacy policy: ${SITE_URL}/legal/privacy`,
  ].join("\n");
  return { subject, html, text };
}

/** Sends the confirmation email with RFC 8058 one-click unsubscribe headers. */
export async function sendConfirmation(to: string, links: LinkSet): Promise<void> {
  const { subject, html, text } = renderConfirmation(links);
  const c = client();
  if (!c) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[updates-email] RESEND_API_KEY missing. To ${to} | ${subject}\n${text}`);
      return;
    }
    throw new Error("RESEND_API_KEY missing");
  }
  const result = await c.emails.send({
    from: FROM,
    to,
    subject,
    html,
    text,
    headers: {
      "List-Unsubscribe": `<${links.oneClickUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  if (result.error) throw new Error(result.error.message);
}
