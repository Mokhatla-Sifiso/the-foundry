/**
 * The review journey is rendered as standalone HTML rather than an app route:
 * it is opened straight from an email, often on a phone, and must not depend on
 * the site's bundle, theme cookie, or a signed-in session.
 */

export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;background:#0a0e10;color:#eef5f8;
display:flex;min-height:100vh;margin:0;align-items:center;justify-content:center;padding:24px;}
.card{background:#141b1f;border:1px solid rgba(178,213,229,.16);border-radius:20px;
padding:clamp(24px,5vw,32px);max-width:460px;width:100%;}
.eyebrow{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;
color:#b2d5e5;margin:0 0 14px;}
h1{font-size:21px;line-height:1.25;margin:0 0 18px;letter-spacing:-.01em;}
.who{font-size:15px;font-weight:600;margin:0 0 2px;}
.addr{font-size:13px;color:rgba(238,245,248,.55);margin:0 0 18px;word-break:break-all;}
dl{margin:0 0 18px;padding:0;}
dt{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
color:rgba(238,245,248,.45);margin:0 0 4px;}
dd{margin:0 0 12px;font-size:14px;line-height:1.5;color:#eef5f8;}
dd:last-child{margin-bottom:0}
.res{color:#b2d5e5;font-weight:600;}
.msg{padding:12px 14px;background:rgba(255,255,255,.05);border-radius:12px;
font-size:14px;line-height:1.6;white-space:pre-wrap;word-break:break-word;}
.row{display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;}
form{flex:1 1 140px;margin:0;}
button{width:100%;appearance:none;border:0;border-radius:999px;padding:13px;font-weight:600;
font-size:14px;cursor:pointer;font-family:inherit;}
.approve{background:#b2d5e5;color:#06181f;}
.reject{background:transparent;color:#eef5f8;border:1px solid rgba(238,245,248,.2);}
.note{margin:18px 0 0;font-size:12px;line-height:1.5;color:rgba(238,245,248,.45);}
p{color:rgba(238,245,248,.7);line-height:1.6;margin:0 0 8px;}
`;

export function reviewPage(title: string, inner: string): Response {
  const html =
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<meta name="robots" content="noindex,nofollow">` +
    `<title>${esc(title)}</title><style>${CSS}</style></head>` +
    `<body><div class="card">${inner}</div></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export function stamp(at: Date): string {
  return `${at.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

export type ReviewField = Readonly<{ label: string; value: string; accent?: boolean }>;

/** One request, its details, and the two things you can do about it. */
export function reviewCard(args: {
  eyebrow: string;
  heading: string;
  name: string;
  email: string;
  fields: ReadonlyArray<ReviewField>;
  message: string | null;
  createdAt: Date;
  token: string;
  approveLabel: string;
  rejectLabel: string;
  note: string;
}): string {
  const fields = args.fields
    .filter((f) => f.value)
    .map(
      (f) =>
        `<dt>${esc(f.label)}</dt><dd${f.accent ? ' class="res"' : ""}>${esc(f.value)}</dd>`,
    )
    .join("");
  const button = (action: string, cls: string, label: string): string =>
    `<form method="POST"><input type="hidden" name="token" value="${esc(args.token)}">` +
    `<input type="hidden" name="action" value="${action}">` +
    `<button class="${cls}" type="submit">${esc(label)}</button></form>`;
  return (
    `<span class="eyebrow">${esc(args.eyebrow)}</span>` +
    `<h1>${esc(args.heading)}</h1>` +
    `<p class="who">${esc(args.name)}</p>` +
    `<p class="addr">${esc(args.email)}</p>` +
    `<dl>${fields}<dt>Requested</dt><dd>${esc(stamp(args.createdAt))}</dd></dl>` +
    (args.message ? `<div class="msg">${esc(args.message)}</div>` : "") +
    `<div class="row">${button("approve", "approve", args.approveLabel)}${button("reject", "reject", args.rejectLabel)}</div>` +
    `<p class="note">${esc(args.note)}</p>`
  );
}

export function reviewResult(ok: boolean, message: string): string {
  return `<span class="eyebrow">${ok ? "Done" : "No change"}</span><h1>${esc(message)}</h1>`;
}

export function reviewEmpty(heading: string, body: string): string {
  return `<span class="eyebrow">Nothing to review</span><h1>${esc(heading)}</h1><p>${esc(body)}</p>`;
}
