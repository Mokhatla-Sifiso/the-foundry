import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { getSessionContext } from "@/lib/auth/admin";
import { cvGrantFor } from "@/lib/access/entitlement";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { SITE } from "@/lib/constants";

export async function GET(): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ message: "Sign in to download the CV." }, { status: 401 });
    }

    const hdrs = await headers();
    if (!(await rateLimit("cv-download", `ip:${clientIp(hdrs)}`))) {
      return NextResponse.json(
        { message: "Too many downloads. Please wait a few minutes." },
        { status: 429 },
      );
    }

    const grant = await cvGrantFor(ctx);
    if (!grant) {
      return NextResponse.json(
        { message: "You don't have access to the CV yet." },
        { status: 403 },
      );
    }

    const filePath = path.join(process.cwd(), "private", "cv", SITE.cvFileName);
    const bytes = await readFile(filePath);

    return new Response(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${SITE.cvFileName}"`,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (err) {
    console.error("[api/cv]", err);
    return NextResponse.json({ message: "Could not fetch the CV." }, { status: 500 });
  }
}
