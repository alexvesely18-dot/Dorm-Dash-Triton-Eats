import { NextRequest, NextResponse } from "next/server";
import { orderStore, Order } from "@/lib/orderStore";

// GET /api/orders/available?dasherCollege=Sixth+College
// Returns orders visible to this dasher.
// Door-delivery orders are only visible to dashers whose college matches the delivery college.
export async function GET(req: NextRequest) {
  const dasherCollege = req.nextUrl.searchParams.get("dasherCollege") ?? "";

  const available = Array.from(orderStore.values()).filter((o) => {
    if (o.status !== "pending") return false;
    if (o.toDoor && o.deliveryCollege !== dasherCollege) return false;
    return true;
  });

  return NextResponse.json({ orders: available });
}

// POST /api/orders  — student places an order
export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = `TDE-${Math.floor(20000 + Math.random() * 79999)}`;

  const order: Order = {
    id,
    status:          "pending",
    hall:            String(body.hall          ?? ""),
    hallEmoji:       String(body.hallEmoji     ?? "🍽"),
    hallCollege:     String(body.hallCollege   ?? ""),
    hallLat:         Number(body.hallLat       ?? 32.8800),
    hallLng:         Number(body.hallLng       ?? -117.2340),
    cart:            Array.isArray(body.cart) ? (body.cart as unknown[]).map(String) : [],
    pid_last4:       body.pid_last4    != null ? String(body.pid_last4)    : null,
    pickup_time:     body.pickup_time  != null ? String(body.pickup_time)  : null,
    order_number:    String(body.order_number  ?? id),
    total:           String(body.total         ?? "$0.00"),
    building:        String(body.building      ?? ""),
    deliveryCollege: String(body.deliveryCollege ?? ""),
    destLat:         Number(body.destLat       ?? 32.8800),
    destLng:         Number(body.destLng       ?? -117.2340),
    room:            body.room != null ? String(body.room) : null,
    toDoor:          Boolean(body.toDoor),
    createdAt:       new Date().toISOString(),
  };

  orderStore.set(id, order);
  return NextResponse.json({ id, order });
}
