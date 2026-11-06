import { NextResponse } from "next/server";
import { isSameOrigin, readFields, seeOther } from "@/lib/request";
import { unsubscribe } from "@/lib/updates/subscribers";
import { parseToken } from "@/lib/updates/validation";

const PAGE = "/updates/unsubscribe";

/**
 * Unsubscribe (spec UG 7.3). The unsubscribe page's form gets a 303 back to the page. A mail
 * provider's RFC 8058 one-click POST (body `List-Unsubscribe=One-Click`, token in the query)
 * gets a bare 200, never a redirect (RFC 8058 section 3.1). One-click requests come from the
 * provider's servers rather than a browser, so the Origin check does not apply: the token alone
 * authorises the deletion.
 */
export async function POST(request: Request): Promise<Response> {
  const fields = await readFields(request);
  const oneClick = fields["List-Unsubscribe"] === "One-Click";
  if (!oneClick && !isSameOrigin(request.headers)) {
    return NextResponse.json({ message: "Requests must come from this site." }, { status: 403 });
  }
  const token = parseToken(
    oneClick ? new URL(request.url).searchParams.get("token") : fields.token,
  );
  try {
    const outcome = token ? await unsubscribe(token) : "invalid";
    return oneClick
      ? new Response(null, { status: 200 })
      : seeOther(request, PAGE, { status: outcome });
  } catch (err) {
    console.error("[updates/unsubscribe]", err);
    // A 5xx lets the mail provider retry a one-click request later.
    return oneClick
      ? new Response(null, { status: 500 })
      : seeOther(request, PAGE, { status: "error" });
  }
}

/**
 * Mail clients that open the List-Unsubscribe URL in a browser send a GET. It only leads to the
 * page and its button, never to a deletion, so link scanners cannot unsubscribe anyone.
 */
export function GET(request: Request): Response {
  const token = parseToken(new URL(request.url).searchParams.get("token"));
  return seeOther(request, PAGE, token ? { token } : { status: "invalid" });
}
