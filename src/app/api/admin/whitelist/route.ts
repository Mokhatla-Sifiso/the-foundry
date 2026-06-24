import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { HttpError, requireAdmin } from "@/lib/auth/admin";
export async function GET(): Promise<Response> {
  try {
    await requireAdmin();
    const entries = await db.adminWhitelist.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, name: true, addedBy: true, createdAt: true },
    });
    return NextResponse.json({ entries });
  } catch (err) {
    return errorResponse(err);
  }
}
export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requireAdmin();
    const payload = (await request.json().catch(() => null)) as {
      email?: unknown;
      name?: unknown;
    } | null;
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const name = typeof payload?.name === "string" ? payload.name.trim() : "";
    if (!email || !email.includes("@")) {
      throw new HttpError(400, "A valid email is required.");
    }
    if (!name) {
      throw new HttpError(400, "Name is required.");
    }
    const created = await db.adminWhitelist.upsert({
      where: { email },
      update: { name },
      create: { email, name, addedBy: ctx.email },
    });
    return NextResponse.json({ entry: created }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return NextResponse.json({ message: err.message }, { status: err.status });
  }
  console.error("[admin/whitelist]", err);
  return NextResponse.json({ message: "Unexpected error." }, { status: 500 });
}
