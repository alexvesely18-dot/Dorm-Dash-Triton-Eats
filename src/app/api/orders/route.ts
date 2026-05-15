import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { getAllOrders, getOrder, setOrder, publicOrder, Order, BUILDING_COORDS, BUILDING_COLLEGE } from "@/lib/orderStore";
import {
  calculateOrder,
  HallId,
  CollegeId,
  DINING_HALLS,
  COLLEGES,
} from "@/lib/pricing";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/validate";

// Trust-anchored hall metadata. The client must not be able to lie about emoji,
// home college, or GPS coordinates of a hall — derive them server-side from
// the validated hallId so a malicious client can't redirect a dasher off-campus.
const HALL_META: Record<HallId, { emoji: string; lat: number; lng: number }> = {
  pines:       { emoji: "🌲", lat: 32.8767, lng: -117.2425 },
  ventanas:    { emoji: "🌅", lat: 32.8862, lng: -117.2421 },
  sixty4:      { emoji: "🌡️", lat: 32.8730, lng: -117.2401 },
  ovt:         { emoji: "🌊", lat: 32.8806, lng: -117.2370 },
  canyon:      { emoji: "🏔️", lat: 32.8836, lng: -117.2330 },
  bistro:      { emoji: "🥪", lat: 32.8850, lng: -117.2402 },
  sixthDining: { emoji: "6️⃣", lat: 32.8911, lng: -117.2436 },
};

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

  // Validate building against the known list (anchors destLat/destLng + deliveryCollege).
  const buildingName = sanitizeText(String(body.building ?? ""), 100);
  const destCoords = BUILDING_COORDS[buildingName];
  if (!destCoords) {
    return NextResponse.json({ error: "Invalid building" }, { status: 400 });
  }
  const deliveryCollege = BUILDING_COLLEGE[buildingName] ?? "";

  // Server-derived hall metadata. Client-supplied hallEmoji/hallLat/etc. are ignored
  // so a malicious client can't redirect a dasher to fake coordinates or inject XSS
  // payloads via the hall fields that show up in dasher screens.
  const hallMeta = HALL_META[hallId];
  const hallCollegeName = COLLEGES[DINING_HALLS[hallId].homeCollege].name;

  // Crypto-random order id with collision retry. Math.random()-based ids had a real
  // birthday-collision rate; using crypto.randomInt and verifying non-existence in
  // Redis before write closes that.
  let id = "";
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = `TDE-${20000 + randomInt(0, 79999)}`;
    const exists = await getOrder(candidate);
    if (!exists) { id = candidate; break; }
  }
  if (!id) {
    return NextResponse.json({ error: "Could not allocate order id, please retry" }, { status: 503 });
  }

  const order: Order = {
    id,
    status:          "pending",
    hall:            DINING_HALLS[hallId].name,
    hallEmoji:       hallMeta.emoji,
    hallCollege:     hallCollegeName,
    hallLat:         hallMeta.lat,
    hallLng:         hallMeta.lng,
    cart,
    pid_last4:       body.pid_last4    != null ? sanitizeText(String(body.pid_last4), 4).replace(/\D/g, "").slice(0, 4) || null : null,
    pickup_time:     body.pickup_time  != null ? sanitizeText(String(body.pickup_time), 20) : null,
    order_number:    sanitizeText(String(body.order_number ?? id), 30),
    deliveryFee:     breakdown.deliveryFee,
    roomFee:         breakdown.roomFee,
    receiptTotal:    breakdown.receiptTotal > 0 ? breakdown.receiptTotal : undefined,
    carbonSavedLbs:  breakdown.carbonSavedLbs,
    adaFreeDelivery: breakdown.adaFreeDelivery,
    total:           breakdown.total,
    tier:            breakdown.tier,
    building:        buildingName,
    deliveryCollege,
    destLat:         destCoords.lat,
    destLng:         destCoords.lng,
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
