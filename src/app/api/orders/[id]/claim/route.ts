import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getOrder, setOrder, publicOrder } from "@/lib/orderStore";
import { redis } from "@/lib/redis";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { isValidOrderId, sanitizeText } from "@/lib/validate";

// POST /api/orders/[id]/claim — atomically claim a pending order for a dasher.
// Uses a Redis NX lock so that two simultaneous /claim calls can't both win
// (the previous get-check-set sequence was racy). Issues a per-order claimSecret
// returned in the response; the dasher must echo it back via X-Claim-Sig on
// every subsequent PATCH so an attacker who guessed the order id can't mark
// the order delivered or spoof GPS.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getIp(req);
  if (!rateLimit(ip, "order-claim", 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  if (!isValidOrderId(id)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const dasherName = sanitizeText(body.dasherName ?? "Your Dasher", 80);
  const rawTransport = String(body.dasherTransport ?? "bike");
  const dasherTransport: "bike" | "scooter" = rawTransport === "scooter" ? "scooter" : "bike";

  // Acquire an atomic 30-second lock — first /claim caller wins, others see "Already claimed".
  const lockKey = `claimLock:${id}`;
  const gotLock = await redis.set(lockKey, dasherName, { nx: true, ex: 30 });
  if (gotLock !== "OK") {
    return NextResponse.json({ error: "Already claimed" }, { status: 409 });
  }

  try {
    const order = await getOrder(id);
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (order.status !== "pending") {
      return NextResponse.json({ error: "Already claimed" }, { status: 409 });
    }

    const claimSecret = randomBytes(24).toString("hex");
    const updated = {
      ...order,
      status: "claimed" as const,
      dasherName,
      dasherTransport,
      claimedAt: new Date().toISOString(),
      claimSecret,
    };
    await setOrder(id, updated);
    // Return the public order plus the secret separately. The secret never appears
    // inside the order object on any later GET.
    return NextResponse.json({ order: publicOrder(updated), claimSecret });
  } finally {
    // Lock auto-expires in 30s but release proactively so a quick refresh sees the
    // claimed status without waiting.
    await redis.del(lockKey).catch(() => {});
  }
}
