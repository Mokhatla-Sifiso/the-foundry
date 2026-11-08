import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isSameOrigin, readFields, seeOther } from "@/lib/request";
import { confirm } from "@/lib/updates/subscribers";
import { parseToken } from "@/lib/updates/validation";

const PAGE = "/updates/confirm";

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request.headers)) {
    return NextResponse.json({ message: "Requests must come from this site." }, { status: 403 });
  }
  let token: string | null = null;
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
