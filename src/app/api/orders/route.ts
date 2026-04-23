import { NextRequest, NextResponse } from "next/server";
import { orderStore, Order } from "@/lib/orderStore";
import {
  calculateOrder,
  HallId,
  CollegeId,
  DINING_HALLS,
  COLLEGES,
} from "@/lib/pricing";

// GET /api/orders?dasherCollege=Sixth+College
// Returns pending orders visible to this dasher.
// Door-delivery orders are only visible to dashers whose college matches (or when college is unset).
// Scheduled orders are hidden until their scheduledFor time arrives.
export async function GET(req: NextRequest) {
  const dasherCollege = req.nextUrl.searchParams.get("dasherCollege") ?? "";
  const now = Date.now();

  const available = Array.from(orderStore.values()).filter((o) => {
    if (o.status !== "pending") return false;
    if (o.toDoor && dasherCollege && o.deliveryCollege !== dasherCollege) return false;
    // Hide orders scheduled for the future
    if (o.scheduledFor && new Date(o.scheduledFor).getTime() > now) return false;
    return true;
  });

  return NextResponse.json({ orders: available });
}

// POST /api/orders  — student places an order
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate hall and college for pricing
  const hallId = body.hall as HallId;
  const collegeId = body.college as CollegeId;
  if (!DINING_HALLS[hallId]) {
    return NextResponse.json({ error: "Invalid dining hall" }, { status: 400 });
  }
  if (!COLLEGES[collegeId]) {
    return NextResponse.json({ error: "Invalid college" }, { status: 400 });
  }

  // Count food vs drink items for pricing engine
  const cart = Array.isArray(body.cart) ? body.cart : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const foodItems  = cart.filter((i: any) => i.type === "food").reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drinkItems = cart.filter((i: any) => i.type === "drink").reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0);

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
    hall:            String(body.hall          ?? ""),
    hallEmoji:       String(body.hallEmoji     ?? "🍽"),
    hallCollege:     String(body.hallCollege   ?? ""),
    hallLat:         Number(body.hallLat)      || 0,
    hallLng:         Number(body.hallLng)      || 0,
    cart:            cart.map(String),
    pid_last4:       body.pid_last4    != null ? String(body.pid_last4)    : null,
    pickup_time:     body.pickup_time  != null ? String(body.pickup_time)  : null,
    order_number:    String(body.order_number  ?? id),
    subtotal:        breakdown.subtotal,
    deliveryFee:     breakdown.deliveryFee,
    total:           breakdown.total,
    tier:            breakdown.tier,
    building:        String(body.building      ?? ""),
    deliveryCollege: String(body.deliveryCollege ?? ""),
    destLat:         Number(body.destLat)      || 0,
    destLng:         Number(body.destLng)      || 0,
    room:            body.room != null ? String(body.room) : null,
    toDoor:          Boolean(body.toDoor),
    scheduledFor:    body.scheduledFor != null ? String(body.scheduledFor) : undefined,
    createdAt:       new Date().toISOString(),
  };

  // Detect smart batch: is there an active claimed order going to the same building?
  const batchMatch = Array.from(orderStore.values()).find(
    (o) => o.status === "claimed" && o.building === order.building && o.dasherName
  );
  if (batchMatch) {
    order.batched = true;
    order.batchDasher = batchMatch.dasherName;
  }

  orderStore.set(id, order);
  return NextResponse.json({ id, order, breakdown });
}
