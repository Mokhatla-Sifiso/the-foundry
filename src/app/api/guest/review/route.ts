import { pendingRequestByToken, reviewGuestRequest } from "@/lib/access/guest";
import { resourceLabel } from "@/lib/access/resources";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function page(title: string, inner: string): Response {
  const html =
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>` +
    `<style>body{font-family:ui-sans-serif,system-ui,sans-serif;background:#0a0e10;color:#eef5f8;` +
    `display:flex;min-height:100vh;margin:0;align-items:center;justify-content:center;padding:24px;}` +
    `.card{background:#141b1f;border:1px solid rgba(178,213,229,.16);border-radius:20px;padding:32px;max-width:440px;width:100%;}` +
    `h1{font-size:20px;margin:0 0 14px;}p{color:rgba(238,245,248,.7);line-height:1.6;margin:0 0 8px;}` +
    `.res{color:#b2d5e5;font-weight:600;}.row{display:flex;gap:10px;margin-top:22px;}` +
    `button{flex:1;appearance:none;border:0;border-radius:999px;padding:12px;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit;}` +
    `.approve{background:#b2d5e5;color:#06181f;}.reject{background:transparent;color:#eef5f8;border:1px solid rgba(238,245,248,.2);}` +
    `.msg{margin-top:12px;padding:10px 12px;background:rgba(255,255,255,.05);border-radius:10px;}</style></head>` +
    `<body><div class="card">${inner}</div></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) return page("Guest access", `<h1>Invalid link</h1><p>No request token provided.</p>`);
  const req = await pendingRequestByToken(token);
  if (!req) {
    return page(
      "Guest access",
      `<h1>Nothing to review</h1><p>This link is invalid, or the request was already handled.</p>`,
    );
  }
  const items = req.resources.map((r) => esc(resourceLabel(r))).join(", ") || "not specified";
  return page(
    "Review guest access",
    `<h1>Review guest access</h1>` +
      `<p><b>${esc(req.name)}</b> &lt;${esc(req.email)}&gt;</p>` +
      `<p>Resources: <span class="res">${items}</span></p>` +
      (req.message ? `<p class="msg">${esc(req.message)}</p>` : "") +
      `<div class="row">` +
      `<form method="POST"><input type="hidden" name="token" value="${esc(token)}"><input type="hidden" name="action" value="approve"><button class="approve" type="submit">Approve · 24 hours</button></form>` +
      `<form method="POST"><input type="hidden" name="token" value="${esc(token)}"><input type="hidden" name="action" value="reject"><button class="reject" type="submit">Reject</button></form>` +
      `</div>`,
  );
}

export async function POST(request: Request): Promise<Response> {
  try {
    const form = await request.formData();
    const token = String(form.get("token") ?? "");
    const raw = String(form.get("action") ?? "");
    const action = raw === "approve" ? "approve" : raw === "reject" ? "reject" : null;
    if (!token || !action) return page("Guest access", `<h1>Invalid request</h1>`);
    const result = await reviewGuestRequest(token, action);
    return page("Guest access", `<h1>${result.ok ? "Done" : "Hmm"}</h1><p>${esc(result.message)}</p>`);
  } catch (err) {
    console.error("[guest/review]", err);
    return page("Guest access", `<h1>Something went wrong</h1><p>Please try again.</p>`);
  }
}
