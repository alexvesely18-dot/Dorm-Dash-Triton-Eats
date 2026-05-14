import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, setOrder, publicOrder, Order } from "@/lib/orderStore";
import {
  calculateOrder,
  HallId,
  CollegeId,
  DINING_HALLS,
  COLLEGES,
} from "@/lib/pricing";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/validate";

// GET /api/orders?dasherCollege=Sixth+College
// Returns pending orders visible to this dasher.
// Door-delivery orders are only visible to dashers whose college matches (or when college is unset).
// Scheduled orders are hidden until their scheduledFor time arrives.
export async function GET(req: NextRequest) {
  const ip = getIp(req);
  if (!rateLimit(ip, "orders-get", 120, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const dasherCollege = req.nextUrl.searchParams.get("dasherCollege") ?? "";
  const now = Date.now();

  const available = (await getAllOrders()).filter((o) => {
    if (o.status !== "pending") return false;
    if (o.toDoor && dasherCollege && o.deliveryCollege !== dasherCollege) return false;
    if (o.scheduledFor && new Date(o.scheduledFor).getTime() > now) return false;
    return true;
  });

  return NextResponse.json({ orders: available.map(publicOrder) });
}

// POST /api/orders  — student places an order
export async function POST(req: NextRequest) {
  try {
    return await handlePost(req);
  } catch (err) {
    console.error("orders POST failed:", err);
    const msg = err instanceof Error ? err.message : String(err);
    const looksLikeRedis = /UPSTASH|redis|fetch failed|ECONNREFUSED|timeout/i.test(msg);
    return NextResponse.json(
      {
        error: looksLikeRedis
          ? `Order storage unavailable: ${msg}. Check UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN on the server.`
          : `Server error: ${msg}`,
      },
      { status: 500 },
    );
  }
}

async function handlePost(req: NextRequest) {
  const ip = getIp(req);
  if (!rateLimit(ip, "orders-post", 10, 60_000)) {
    return NextResponse.json({ error: "Too many orders. Please wait." }, { status: 429 });
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Order storage not configured: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN missing on the server.",
      },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate hall and college for pricing
  const hallId = body.hall as HallId;
  const collegeId = body.college as CollegeId;
  if (!DINING_HALLS[hallId]) {
    return NextResponse.json({ error: "Invalid dining hall" }, { status: 400 });
  }
  if (!COLLEGES[collegeId]) {
    return NextResponse.json({ error: "Invalid college" }, { status: 400 });
  }

  // Parse cart — items may be objects {name, quantity, type} or legacy strings.
  // We no longer price food on the platform; cart is just a list of item names + quantities
  // so the dasher knows what to grab at the counter.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawCart: any[] = Array.isArray(body.cart) ? body.cart.slice(0, 50) : [];
  const cart: string[] = rawCart.map((i) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof i === "string" ? sanitizeText(i, 100) : `${Number((i as any).quantity) || 1}× ${sanitizeText(String((i as any).name), 100)}`
  );
  if (cart.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Parse optional Triton2Go receipt total from the OCR. Kept as an internal
  // analytics metric (food revenue we drove); never displayed in the app.
  const rawReceipt = body.receiptTotal ?? null;
  let receiptTotal: number | undefined;
  if (rawReceipt != null) {
    const cleaned = String(rawReceipt).replace(/[^0-9.]/g, "");
    const n = parseFloat(cleaned);
    if (Number.isFinite(n) && n > 0 && n < 1000) receiptTotal = n;
  }

  const breakdown = calculateOrder({
    hall: hallId,
    college: collegeId,
    deliverToRoom: Boolean(body.deliverToRoom),
    adaFreeDelivery: Boolean(body.adaFreeDelivery),
    receiptTotal,
  });

  const id = `TDE-${Math.floor(20000 + Math.random() * 79999)}`;

  const order: Order = {
    id,
    status:          "pending",
    hall:            DINING_HALLS[hallId].name,
    hallEmoji:       sanitizeText(body.hallEmoji     ?? "🍽", 10),
    hallCollege:     sanitizeText(body.hallCollege   ?? "", 80),
    hallLat:         Number.isFinite(Number(body.hallLat)) ? Number(body.hallLat) : 32.8800,
    hallLng:         Number.isFinite(Number(body.hallLng)) ? Number(body.hallLng) : -117.2340,
    cart,
    pid_last4:       body.pid_last4    != null ? sanitizeText(String(body.pid_last4), 4) : null,
    pickup_time:     body.pickup_time  != null ? sanitizeText(String(body.pickup_time), 20) : null,
    order_number:    sanitizeText(String(body.order_number ?? id), 30),
    deliveryFee:     breakdown.deliveryFee,
    roomFee:         breakdown.roomFee,
    receiptTotal:    breakdown.receiptTotal > 0 ? breakdown.receiptTotal : undefined,
    carbonSavedLbs:  breakdown.carbonSavedLbs,
    adaFreeDelivery: breakdown.adaFreeDelivery,
    total:           breakdown.total,
    tier:            breakdown.tier,
    building:        sanitizeText(String(body.building      ?? ""), 100),
    deliveryCollege: sanitizeText(String(body.deliveryCollege ?? ""), 80),
    destLat:         Number.isFinite(Number(body.destLat)) ? Number(body.destLat) : 32.8800,
    destLng:         Number.isFinite(Number(body.destLng)) ? Number(body.destLng) : -117.2340,
    room:            body.room != null ? sanitizeText(String(body.room), 20) : null,
    toDoor:          Boolean(body.toDoor),
    // scheduledFor must parse as a real date that's within the next 7 days. Rejects
    // garbage strings and far-future spam without throwing.
    scheduledFor:    (() => {
      if (body.scheduledFor == null) return undefined;
      const s = String(body.scheduledFor);
      const t = Date.parse(s);
      if (isNaN(t)) return undefined;
      const now = Date.now();
      if (t < now - 60_000 || t > now + 7 * 24 * 3600 * 1000) return undefined;
      return new Date(t).toISOString();
    })(),
    createdAt:       new Date().toISOString(),
  };

  // Detect smart batch: is there an active claimed order going to the same building?
  const allOrders = await getAllOrders();
  const batchMatch = allOrders.find(
    (o) => o.status === "claimed" && o.building === order.building && o.dasherName
  );
  if (batchMatch) {
    order.batched = true;
    order.batchDasher = batchMatch.dasherName;
  }

  await setOrder(id, order);
  return NextResponse.json({ id, order: publicOrder(order), breakdown });
}
