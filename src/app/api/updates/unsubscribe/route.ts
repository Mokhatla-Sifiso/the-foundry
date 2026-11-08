import { NextResponse } from "next/server";
import { isSameOrigin, readFields, seeOther } from "@/lib/request";
import { unsubscribe } from "@/lib/updates/subscribers";
import { parseToken } from "@/lib/updates/validation";

const PAGE = "/updates/unsubscribe";

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
    if (oneClick) return new Response(null, { status: 500 });
    return seeOther(request, PAGE, token ? { status: "error", token } : { status: "error" });
  }
}

export function GET(request: Request): Response {
  const token = parseToken(new URL(request.url).searchParams.get("token"));
  return seeOther(request, PAGE, token ? { token } : { status: "invalid" });
}
