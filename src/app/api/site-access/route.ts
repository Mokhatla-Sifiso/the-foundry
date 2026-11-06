import { NextResponse } from "next/server";
import { ACCESS_COOKIE, ACCESS_MAX_AGE, ACCESS_VALUE, safeReturnPath } from "@/lib/gate/access";
import { isSameOrigin, readFields } from "@/lib/request";

/**
 * "Go to previous portfolio version for now" (spec UG 7.4, FR-UG-02, FR-UG-03): remembers the
 * choice in the access cookie and sends the visitor back to the page they asked for. A plain
 * form POST answered with a 303, so it works without JavaScript.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request.headers)) {
    return NextResponse.json({ message: "Requests must come from this site." }, { status: 403 });
  }
  const path = safeReturnPath((await readFields(request)).return);
  const response = NextResponse.redirect(new URL(path, request.url), 303);
  response.cookies.set(ACCESS_COOKIE, ACCESS_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  return response;
}
