import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isSameOrigin, readFields, seeOther } from "@/lib/request";
import { confirm } from "@/lib/updates/subscribers";
import { parseToken } from "@/lib/updates/validation";

const PAGE = "/updates/confirm";

/**
 * The confirm page's form (spec UG 7.2). Confirming takes a POST, not a link, so mail scanners
 * that open links cannot confirm addresses. Every outcome is a 303 back to the page.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request.headers)) {
    return NextResponse.json({ message: "Requests must come from this site." }, { status: 403 });
  }
  let token: string | null = null;
  // Limited and error keep the token, so the page can offer Confirm again straight away.
  const retry = (status: "limited" | "error"): Response =>
    seeOther(request, PAGE, token ? { status, token } : { status });
  try {
    token = parseToken((await readFields(request)).token);
    if (!(await rateLimit("updates-confirm", `ip:${clientIp(request.headers)}`))) {
      return retry("limited");
    }
    return seeOther(request, PAGE, { status: token ? await confirm(token) : "invalid" });
  } catch (err) {
    console.error("[updates/confirm]", err);
    return retry("error");
  }
}
