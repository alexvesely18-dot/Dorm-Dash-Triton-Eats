import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, publicOrder } from "@/lib/orderStore";
import { isValidAdminToken } from "@/lib/adminAuth";
import { rateLimit, getIp } from "@/lib/rateLimit";

// GET /api/admin/orders — returns all orders, newest first (requires admin token)
export async function GET(req: NextRequest) {
  const ip = getIp(req);
  if (!rateLimit(ip, "admin-orders", 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  if (!(await isValidAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = (await getAllOrders()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ orders: orders.map(publicOrder) });
}
