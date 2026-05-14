import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getOrder, setOrder, publicOrder } from "@/lib/orderStore";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { isValidOrderId, sanitizeText } from "@/lib/validate";

// POST /api/orders/[id]/claim — atomically claim a pending order for a dasher.
// Issues a per-order claimSecret returned in the response; the dasher's client must
// echo it back via the X-Claim-Sig header on every subsequent PATCH so a random
// caller who guessed the order id cannot mark the order delivered or spoof GPS.
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

  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "pending") {
    return NextResponse.json({ error: "Already claimed" }, { status: 409 });
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
}
