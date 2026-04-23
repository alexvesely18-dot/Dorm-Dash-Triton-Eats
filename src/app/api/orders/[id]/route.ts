import { NextRequest, NextResponse } from "next/server";
import { orderStore } from "@/lib/orderStore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = orderStore.get(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = orderStore.get(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const updated = { ...order, ...body };
  orderStore.set(id, updated);
  return NextResponse.json({ order: updated });
}
