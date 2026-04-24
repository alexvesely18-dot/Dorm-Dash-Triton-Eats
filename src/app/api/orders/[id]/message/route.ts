import { NextRequest, NextResponse } from "next/server";
import { orderStore } from "@/lib/orderStore";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { isValidOrderId, sanitizeText, isOneOf } from "@/lib/validate";

// POST /api/orders/:id/message  { from: "student"|"dasher", text: string }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getIp(req);
  if (!rateLimit(ip, "order-message", 30, 60_000)) {
    return NextResponse.json({ error: "Too many messages. Slow down." }, { status: 429 });
  }

  const { id } = await params;
  if (!isValidOrderId(id)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = orderStore.get(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const from = body.from;
  if (!isOneOf(from, ["student", "dasher"])) {
    return NextResponse.json({ error: "Invalid sender" }, { status: 400 });
  }

  const text = sanitizeText(body.text, 500);
  if (!text) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const msg = { from, text, at: new Date().toISOString() };
  order.messages = [...(order.messages ?? []), msg];
  orderStore.set(id, order);

  return NextResponse.json({ message: msg, messages: order.messages });
}

// GET /api/orders/:id/message — returns all messages for polling
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getIp(req);
  if (!rateLimit(ip, "order-message-get", 120, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  if (!isValidOrderId(id)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = orderStore.get(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ messages: order.messages ?? [] });
}
