import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, GATE_PATH, RETURN_HEADER, hasAccess, isExempt } from "@/lib/gate/access";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";

export function proxy(request: NextRequest): NextResponse {
  const host = (request.headers.get("host") ?? request.nextUrl.host).toLowerCase();
  if (process.env.VERCEL_ENV === "production" && host.endsWith(".vercel.app")) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(new URL(`${pathname}${search}`, PRODUCTION_SITE_URL), 308);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const gaEnabled = /^G-[A-Z0-9]{4,}$/i.test(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "");
  const gaScript = gaEnabled ? " https://www.googletagmanager.com" : "";
  const gaConnect = gaEnabled
    ? " https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com"
    : "";
  const gaImg = gaEnabled ? " https://www.googletagmanager.com https://*.google-analytics.com" : "";

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}${gaScript}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data:${gaImg}`,
    `font-src 'self'`,
    `connect-src 'self'${isDev ? " ws: wss:" : ""}${gaConnect}`,
    `object-src 'none'`,
    `base-uri 'none'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `manifest-src 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const { pathname, search } = request.nextUrl;
  const gated = !isExempt(pathname) && !hasAccess(request.cookies.get(ACCESS_COOKIE)?.value);
  if (gated) requestHeaders.set(RETURN_HEADER, `${pathname}${search}`);
  else requestHeaders.delete(RETURN_HEADER);

  const response = gated
    ? NextResponse.rewrite(new URL(GATE_PATH, request.url), {
        request: { headers: requestHeaders },
      })
    : NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
