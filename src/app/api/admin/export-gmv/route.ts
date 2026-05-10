import { NextRequest, NextResponse } from "next/server";
import { getAllOrders } from "@/lib/orderStore";
import { isValidAdminToken } from "@/lib/adminAuth";
import { rateLimit, getIp } from "@/lib/rateLimit";

// GET /api/admin/export-gmv?month=YYYY-MM — CSV of all delivered orders for an HDH commission report.
// Returns Date, OrderID, Hall, Subtotal, DeliveryFee, RoomFee, Total, Commission so HDH can reconcile.
export async function GET(req: NextRequest) {
  const ip = getIp(req);
  if (!rateLimit(ip, "admin-export", 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  if (!isValidAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const month = req.nextUrl.searchParams.get("month");
  const all = await getAllOrders();
  const filtered = all.filter(o => {
    if (o.status !== "delivered") return false;
    if (!month) return true;
    const placed = new Date(o.createdAt);
    const ym = `${placed.getFullYear()}-${String(placed.getMonth() + 1).padStart(2, "0")}`;
    return ym === month;
  });

  const header = [
    "Date", "OrderID", "Hall", "Triton2GoReceiptTotal", "DeliveryFee", "RoomFee", "PlatformCharge", "HDHCommission", "Building", "ADA",
  ].join(",");
  const rows = filtered.map(o => [
    new Date(o.createdAt).toISOString(),
    o.id,
    `"${o.hall.replace(/"/g, '""')}"`,
    (o.receiptTotal ?? 0).toFixed(2),
    o.deliveryFee.toFixed(2),
    (o.roomFee ?? 0).toFixed(2),
    o.total.toFixed(2),
    (o.commission ?? 0).toFixed(2),
    `"${o.building.replace(/"/g, '""')}"`,
    o.adaFreeDelivery ? "yes" : "no",
  ].join(","));

  const csv = [header, ...rows].join("\n");
  const filename = month ? `hdh-gmv-${month}.csv` : "hdh-gmv-all.csv";
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
