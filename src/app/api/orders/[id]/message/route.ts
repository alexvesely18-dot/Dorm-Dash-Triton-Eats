import { NextRequest, NextResponse } from "next/server";
import { getOrder, setOrder } from "@/lib/orderStore";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { isValidOrderId, sanitizeText, isOneOf } from "@/lib/validate";
import { timingSafeStringEqual } from "@/lib/adminAuth";

// POST /api/orders/:id/message  { from: "student"|"dasher", text: string }
// Dasher-sent messages require X-Claim-Sig matching the order so a stranger
// who guessed the order id can't impersonate the dasher in chat. Student-side
// messages stay open (the student is whoever owns the device with the order id).
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

  const order = await getOrder(id);
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

  // Dasher must prove they hold the claim secret. Without this, anyone with
  // the order id could send messages spoofed as the dasher.
  if (from === "dasher") {
    const sig = req.headers.get("x-claim-sig") ?? "";
    if (!order.claimSecret || !sig || !timingSafeStringEqual(sig, order.claimSecret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const text = sanitizeText(body.text, 500);
  if (!text) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  // Cap stored history to avoid unbounded growth (and a denial-of-storage attack
  // where someone hammers messages forever).
  const messages = [...(order.messages ?? []), { from, text, at: new Date().toISOString() }].slice(-200);
  order.messages = messages;
  await setOrder(id, order);

  return NextResponse.json({ message: messages[messages.length - 1], messages });
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

  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ messages: order.messages ?? [] });
}
