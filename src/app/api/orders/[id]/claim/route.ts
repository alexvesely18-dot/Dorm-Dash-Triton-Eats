import { NextRequest, NextResponse } from "next/server";
import { orderStore } from "@/lib/orderStore";

// POST /api/orders/[id]/claim
// Atomically claim a pending order for a dasher.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = orderStore.get(id);

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "pending") {
    return NextResponse.json({ error: "Already claimed" }, { status: 409 });
  }

  const { dasherName, dasherTransport } = await req.json();
  const updated = {
    ...order,
    status: "claimed" as const,
    dasherName:      dasherName      ?? "Your Dasher",
    dasherTransport: dasherTransport ?? "bike",
    claimedAt: new Date().toISOString(),
  };
  orderStore.set(id, updated);
  return NextResponse.json({ order: updated });
}
