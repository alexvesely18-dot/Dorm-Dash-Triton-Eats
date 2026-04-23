import { NextResponse } from "next/server";
import { orderStore } from "@/lib/orderStore";

// GET /api/admin/orders — returns all orders, newest first
export async function GET() {
  const orders = Array.from(orderStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ orders });
}
