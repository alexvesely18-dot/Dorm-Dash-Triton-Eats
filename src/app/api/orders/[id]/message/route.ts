import { NextRequest, NextResponse } from "next/server";
import { orderStore } from "@/lib/orderStore";

// POST /api/orders/:id/message  { from: "student"|"dasher", text: string }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = orderStore.get(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { from, text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const msg = { from: String(from), text: String(text).trim(), at: new Date().toISOString() };
  order.messages = [...(order.messages ?? []), msg];
  orderStore.set(id, order);

  return NextResponse.json({ message: msg, messages: order.messages });
}

// GET /api/orders/:id/message — returns all messages for polling
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = orderStore.get(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ messages: order.messages ?? [] });
}
