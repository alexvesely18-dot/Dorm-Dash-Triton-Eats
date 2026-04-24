import { NextRequest, NextResponse } from "next/server";
import { orderStore } from "@/lib/orderStore";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { isValidOrderId, sanitizeText } from "@/lib/validate";

// POST /api/orders/[id]/claim — atomically claim a pending order for a dasher
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

  const order = orderStore.get(id);
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

  const updated = {
    ...order,
    status: "claimed" as const,
    dasherName,
    dasherTransport,
    claimedAt: new Date().toISOString(),
  };
  orderStore.set(id, updated);
  return NextResponse.json({ order: updated });
}
