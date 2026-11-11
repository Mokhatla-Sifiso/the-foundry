import { NextResponse } from "next/server";
import { ACCESS_COOKIE, ACCESS_VALUE, safeReturnPath } from "@/lib/gate/access";
import { isSameOrigin, readFields } from "@/lib/request";

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request.headers)) {
    return NextResponse.json({ message: "Requests must come from this site." }, { status: 403 });
  }
  const path = safeReturnPath((await readFields(request)).return);
  const response = NextResponse.redirect(new URL(path, request.url), 303);
  response.cookies.set(ACCESS_COOKIE, ACCESS_VALUE, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return response;
}
