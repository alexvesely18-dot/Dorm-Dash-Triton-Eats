import { NextRequest, NextResponse } from "next/server";
import { createAdminToken } from "@/lib/adminAuth";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/validate";

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (!rateLimit(ip, "admin-login", 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in 1 minute." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = sanitizeText(body.email, 100);
  const password = String(body.password ?? "").slice(0, 100);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASS;

  if (!adminEmail || !adminPass) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (email !== adminEmail || password !== adminPass) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = createAdminToken();
  return NextResponse.json({ token });
}
