import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, setOrder, Order } from "@/lib/orderStore";
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

  return NextResponse.json({ orders: available });
}

// POST /api/orders  — student places an order
export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (!rateLimit(ip, "orders-post", 10, 60_000)) {
    return NextResponse.json({ error: "Too many orders. Please wait." }, { status: 429 });
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

  // Parse cart — items may be objects {name, quantity, type} or legacy strings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawCart: any[] = Array.isArray(body.cart) ? body.cart.slice(0, 50) : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const foodItems  = rawCart.filter((i: any) => i.type === "food").reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drinkItems = rawCart.filter((i: any) => i.type === "drink").reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0);
  // Normalise to human-readable strings for storage and dasher display
  const cart: string[] = rawCart.map((i) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof i === "string" ? sanitizeText(i, 100) : `${Number((i as any).quantity) || 1}× ${sanitizeText(String((i as any).name), 100)}`
  );

  const breakdown = calculateOrder({
    hall: hallId,
    college: collegeId,
    foodItems,
    drinkItems,
    deliverToRoom: Boolean(body.deliverToRoom),
  });

  if (!breakdown.meetsMinimum) {
    return NextResponse.json(
      { error: `Minimum order is $4.00. Add $${breakdown.minimumShortfall.toFixed(2)} more.` },
      { status: 400 }
    );
  }

  const id = `TDE-${Math.floor(20000 + Math.random() * 79999)}`;

  const order: Order = {
    id,
    status:          "pending",
    hall:            DINING_HALLS[hallId].name,
    hallEmoji:       sanitizeText(body.hallEmoji     ?? "🍽", 10),
    hallCollege:     sanitizeText(body.hallCollege   ?? "", 80),
    hallLat:         Number(body.hallLat)      || 0,
    hallLng:         Number(body.hallLng)      || 0,
    cart,
    pid_last4:       body.pid_last4    != null ? sanitizeText(String(body.pid_last4), 4) : null,
    pickup_time:     body.pickup_time  != null ? sanitizeText(String(body.pickup_time), 20) : null,
    order_number:    sanitizeText(String(body.order_number ?? id), 30),
    subtotal:        breakdown.subtotal,
    deliveryFee:     breakdown.deliveryFee,
    total:           breakdown.total,
    tier:            breakdown.tier,
    building:        sanitizeText(String(body.building      ?? ""), 100),
    deliveryCollege: sanitizeText(String(body.deliveryCollege ?? ""), 80),
    destLat:         Number(body.destLat)      || 0,
    destLng:         Number(body.destLng)      || 0,
    room:            body.room != null ? sanitizeText(String(body.room), 20) : null,
    toDoor:          Boolean(body.toDoor),
    scheduledFor:    body.scheduledFor != null ? String(body.scheduledFor) : undefined,
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
  return NextResponse.json({ id, order, breakdown });
}
