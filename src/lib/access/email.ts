import { Resend } from "resend";
import { SITE } from "@/lib/constants";
import { SITE_URL } from "@/lib/site-url";
import { GUEST_GRANT_HOURS, formatGrantExpiry, resourceLabel } from "./resources";

const FROM = process.env.RESEND_FROM ?? "Mzwakhe Mokhatla <noreply@example.com>";

let resend: Resend | null | undefined;
function client(): Resend | null {
  if (resend !== undefined) return resend;
  const key = process.env.RESEND_API_KEY;
  resend = key ? new Resend(key) : null;
  return resend;
}

async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  const c = client();
  if (!c) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[access-email] RESEND_API_KEY missing. To ${to} | ${subject}\n${text}`);
      return;
    }
    throw new Error("RESEND_API_KEY missing");
  }
  const result = await c.emails.send({ from: FROM, to, subject, text, html });
  if (result.error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[access-email] send to ${to} failed: ${result.error.message}`);
      return;
    }
    throw new Error(result.error.message);
  }
}

const shell = (body: string): string =>
  `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0a0a0a;">${body}</div>`;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendGuestRequestToOwner(args: {
  name: string;
  email: string;
  resources: ReadonlyArray<string>;
  message: string;
  token: string;
}): Promise<void> {
  const link = `${SITE_URL}/api/guest/review?token=${args.token}`;
  const items = args.resources.map(resourceLabel).join(", ") || "not specified";
  const subject = `Guest access request from ${args.name}`;
  const text =
    `${args.name} (${args.email}) is requesting guest access.\n\n` +
    `Resources: ${items}\n` +
    (args.message ? `Message: ${args.message}\n` : "") +
    `\nReview and approve or reject: ${link}`;
  const html = shell(
    `<h2 style="margin:0 0 8px;">New guest access request</h2>` +
      `<p style="margin:0 0 4px;"><b>${esc(args.name)}</b> &lt;${esc(args.email)}&gt;</p>` +
      `<p style="margin:0 0 4px;color:#555;">Resources: ${esc(items)}</p>` +
      (args.message
        ? `<p style="margin:8px 0;padding:10px 12px;background:#f4f4f5;border-radius:8px;">${esc(args.message)}</p>`
        : "") +
      `<p style="margin:20px 0 0;"><a href="${link}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:11px 18px;border-radius:999px;text-decoration:none;font-weight:600;">Review this request</a></p>` +
      `<p style="margin:12px 0 0;color:#888;font-size:12px;">Approving grants ${esc(args.name)} ${GUEST_GRANT_HOURS} hours of access.</p>`,
  );
  await send(SITE.email, subject, html, text);
}

export async function sendGuestReceipt(to: string, name: string): Promise<void> {
  const subject = "Your access request is in";
  const text = `Hi ${name}, your request has been received. Mzwakhe reviews these personally, so you'll hear back by email once it's approved.`;
  const html = shell(
    `<h2 style="margin:0 0 8px;">Request received</h2>` +
      `<p style="margin:0;color:#333;line-height:1.6;">Hi ${esc(name)}, your access request is in. I review these personally, so you'll get an email the moment it's approved.</p>`,
  );
  await send(to, subject, html, text);
}

export async function sendGuestDecision(
  to: string,
  name: string,
  approved: boolean,
  expiresAt?: Date,
): Promise<void> {
  if (approved) {
    const until = expiresAt ? formatGrantExpiry(expiresAt) : "";
    const subject = "Access approved";
    const text = `Hi ${name}, your access is approved for the next ${GUEST_GRANT_HOURS} hours${until ? `, closing ${until}` : ""}. Head back to ${SITE_URL}/guest and verify the same email to view it. The window is short, so grab what you need now.`;
    const html = shell(
      `<h2 style="margin:0 0 8px;">You're in</h2>` +
        `<p style="margin:0 0 16px;color:#333;line-height:1.6;">Hi ${esc(name)}, your access is approved for the next <b>${GUEST_GRANT_HOURS} hours</b>${until ? `, closing <b>${until}</b>` : ""}. The window is short, so grab what you need now.</p>` +
        `<p style="margin:0;"><a href="${SITE_URL}/guest" style="display:inline-block;background:#0a0a0a;color:#fff;padding:11px 18px;border-radius:999px;text-decoration:none;font-weight:600;">View your access</a></p>`,
    );
    await send(to, subject, html, text);
    return;
  }
  const subject = "About your access request";
  const text = `Hi ${name}, thanks for your interest. I wasn't able to approve this request, but feel free to reach me directly at ${SITE.email}.`;
  const html = shell(
    `<h2 style="margin:0 0 8px;">Thanks for reaching out</h2>` +
      `<p style="margin:0;color:#333;line-height:1.6;">Hi ${esc(name)}, I wasn't able to approve this request this time. You're welcome to reach me directly at <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>`,
  );
  await send(to, subject, html, text);
}

export async function sendExecutiveDemoToOwner(args: {
  name: string;
  email: string;
  slot: string;
  topic: string;
  message: string;
}): Promise<void> {
  const subject = `Demo request from ${args.name}`;
  const text =
    `${args.name} (${args.email}) would like to book a demo.\n\n` +
    `Preferred slot: ${args.slot}\n` +
    (args.topic ? `Focus: ${args.topic}\n` : "") +
    (args.message ? `Notes: ${args.message}\n` : "");
  const html = shell(
    `<h2 style="margin:0 0 8px;">New demo request</h2>` +
      `<p style="margin:0 0 4px;"><b>${esc(args.name)}</b> &lt;${esc(args.email)}&gt;</p>` +
      `<p style="margin:0 0 4px;color:#555;">Preferred slot: <b>${esc(args.slot)}</b></p>` +
      (args.topic ? `<p style="margin:0 0 4px;color:#555;">Focus: ${esc(args.topic)}</p>` : "") +
      (args.message
        ? `<p style="margin:8px 0;padding:10px 12px;background:#f4f4f5;border-radius:8px;">${esc(args.message)}</p>`
        : "") +
      `<p style="margin:20px 0 0;"><a href="mailto:${esc(args.email)}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:11px 18px;border-radius:999px;text-decoration:none;font-weight:600;">Reply to ${esc(args.name)}</a></p>`,
  );
  await send(SITE.email, subject, html, text);
}

export async function sendExecutiveRepoToOwner(args: {
  name: string;
  email: string;
  repos: string;
  purpose: string;
  message: string;
}): Promise<void> {
  const subject = `Repo access request from ${args.name}`;
  const text =
    `${args.name} (${args.email}) is requesting repository access.\n\n` +
    `Repositories / projects: ${args.repos}\n` +
    (args.purpose ? `Purpose: ${args.purpose}\n` : "") +
    (args.message ? `Notes: ${args.message}\n` : "");
  const html = shell(
    `<h2 style="margin:0 0 8px;">New repo access request</h2>` +
      `<p style="margin:0 0 4px;"><b>${esc(args.name)}</b> &lt;${esc(args.email)}&gt;</p>` +
      `<p style="margin:0 0 4px;color:#555;">Repositories: <b>${esc(args.repos)}</b></p>` +
      (args.purpose
        ? `<p style="margin:0 0 4px;color:#555;">Purpose: ${esc(args.purpose)}</p>`
        : "") +
      (args.message
        ? `<p style="margin:8px 0;padding:10px 12px;background:#f4f4f5;border-radius:8px;">${esc(args.message)}</p>`
        : "") +
      `<p style="margin:20px 0 0;"><a href="mailto:${esc(args.email)}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:11px 18px;border-radius:999px;text-decoration:none;font-weight:600;">Reply to ${esc(args.name)}</a></p>`,
  );
  await send(SITE.email, subject, html, text);
}

export async function sendExecutiveReceipt(
  to: string,
  name: string,
  kind: "demo" | "repo",
): Promise<void> {
  const what = kind === "demo" ? "demo request" : "repo access request";
  const subject = `Your ${what} is in`;
  const text = `Hi ${name}, your ${what} has been received. I'll come back to you personally by email shortly.`;
  const html = shell(
    `<h2 style="margin:0 0 8px;">Request received</h2>` +
      `<p style="margin:0;color:#333;line-height:1.6;">Hi ${esc(name)}, your ${what} is in. I'll come back to you personally by email shortly.</p>`,
  );
  await send(to, subject, html, text);
}

export async function sendContactToOwner(args: {
  name: string;
  email: string;
  intent: string;
  message: string;
}): Promise<void> {
  const subject = `New enquiry from ${args.name} (${args.intent})`;
  const text =
    `${args.name} (${args.email}) reached out through the site.\n\n` +
    `About: ${args.intent}\n\n` +
    `${args.message}\n`;
  const html = shell(
    `<h2 style="margin:0 0 8px;">New enquiry</h2>` +
      `<p style="margin:0 0 4px;"><b>${esc(args.name)}</b> &lt;${esc(args.email)}&gt;</p>` +
      `<p style="margin:0 0 4px;color:#555;">About: <b>${esc(args.intent)}</b></p>` +
      `<p style="margin:8px 0;padding:10px 12px;background:#f4f4f5;border-radius:8px;white-space:pre-wrap;">${esc(args.message)}</p>` +
      `<p style="margin:20px 0 0;"><a href="mailto:${esc(args.email)}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:11px 18px;border-radius:999px;text-decoration:none;font-weight:600;">Reply to ${esc(args.name)}</a></p>`,
  );
  await send(SITE.email, subject, html, text);
}
