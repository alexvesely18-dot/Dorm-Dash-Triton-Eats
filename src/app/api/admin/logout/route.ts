import { NextRequest, NextResponse } from "next/server";
import { revokeAdminToken } from "@/lib/adminAuth";
import { rateLimit, getIp } from "@/lib/rateLimit";

// POST /api/admin/logout — server-side token revocation so a stolen localStorage
// token can be invalidated. The client also clears its local copy on logout, but
// without this endpoint a leaked token would stay valid for its full 24h TTL.
export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (!rateLimit(ip, "admin-logout", 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  if (token) await revokeAdminToken(token);
  return NextResponse.json({ ok: true });
}
