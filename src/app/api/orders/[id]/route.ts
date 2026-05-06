import { NextRequest, NextResponse } from "next/server";
import { getOrder, setOrder } from "@/lib/orderStore";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { isValidOrderId, sanitizeText } from "@/lib/validate";

const PATCHABLE_FIELDS = new Set([
  "status",
  "dasherName",
  "dasherTransport",
  "dasherLat",
  "dasherLng",
  "claimedAt",
  "pickedUpAt",
  "deliveredAt",
  "rating",
  "dasherRating",
]);

const VALID_STATUSES = new Set(["pending", "claimed", "picked_up", "delivered"]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getIp(req);
  if (!rateLimit(ip, "order-get", 120, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  if (!isValidOrderId(id)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getIp(req);
  if (!rateLimit(ip, "order-patch", 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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

  // Only allow whitelisted fields
  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (!PATCHABLE_FIELDS.has(key)) continue;

    if (key === "status") {
      if (!VALID_STATUSES.has(String(body[key]))) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      patch.status = body[key];
    } else if (key === "dasherName") {
      patch.dasherName = sanitizeText(body[key], 80);
    } else if (key === "dasherTransport") {
      const t = String(body[key]);
      patch.dasherTransport = t === "scooter" ? "scooter" : "bike";
    } else if (key === "dasherLat" || key === "dasherLng") {
      const n = Number(body[key]);
      if (Number.isFinite(n)) patch[key] = n;
    } else if (key === "rating" || key === "dasherRating") {
      const n = Number(body[key]);
      if (Number.isFinite(n) && n >= 1 && n <= 5) patch[key] = Math.round(n);
    } else if (key === "claimedAt" || key === "pickedUpAt" || key === "deliveredAt") {
      const s = String(body[key]);
      if (!isNaN(Date.parse(s))) patch[key] = s;
    }
  }

  const updated = { ...order, ...patch };
  await setOrder(id, updated);
  return NextResponse.json({ order: updated });
}
