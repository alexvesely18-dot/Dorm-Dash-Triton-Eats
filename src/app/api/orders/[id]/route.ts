import { NextRequest, NextResponse } from "next/server";
import { getOrder, setOrder, publicOrder } from "@/lib/orderStore";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { isValidOrderId, sanitizeText } from "@/lib/validate";
import { isValidAdminToken, timingSafeStringEqual } from "@/lib/adminAuth";

// Fields a dasher is allowed to modify (with a matching X-Claim-Sig)
const DASHER_FIELDS = new Set([
  "status",
  "dasherName",
  "dasherTransport",
  "dasherLat",
  "dasherLng",
  "claimedAt",
  "pickedUpAt",
  "deliveredAt",
]);

// Fields anyone with the order id can modify (low-stakes feedback only)
const STUDENT_FIELDS = new Set([
  "studentRating",
  "studentRatingComment",
  // Legacy alias kept so the old front-end button keeps working
  "rating",
  "dasherRating",
]);

const PATCHABLE_FIELDS = new Set<string>([...DASHER_FIELDS, ...STUDENT_FIELDS]);
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
  return NextResponse.json({ order: publicOrder(order) });
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

  // Determine which auth tier the caller is in. Highest privilege wins.
  const bearer = req.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  const claimSig = req.headers.get("x-claim-sig") ?? null;
  const isAdmin  = await isValidAdminToken(bearer);
  const isDasher = !isAdmin
    && !!claimSig
    && !!order.claimSecret
    && timingSafeStringEqual(claimSig, order.claimSecret);

  // Figure out which fields are being touched and gate on the caller's tier.
  const requestedFields = Object.keys(body).filter((k) => PATCHABLE_FIELDS.has(k));
  if (requestedFields.length === 0) {
    return NextResponse.json({ error: "No patchable fields" }, { status: 400 });
  }
  const touchesDasherField = requestedFields.some((k) => DASHER_FIELDS.has(k));
  if (touchesDasherField && !isAdmin && !isDasher) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patch: Record<string, unknown> = {};
  for (const key of requestedFields) {
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
      // Reject obviously-bogus coordinates (must be plausibly on Earth).
      if (Number.isFinite(n) && Math.abs(n) <= 180) patch[key] = n;
    } else if (key === "rating" || key === "dasherRating" || key === "studentRating") {
      const n = Number(body[key]);
      if (Number.isFinite(n) && n >= 1 && n <= 5) patch[key] = Math.round(n);
    } else if (key === "studentRatingComment") {
      patch.studentRatingComment = sanitizeText(body[key], 500);
    } else if (key === "claimedAt" || key === "pickedUpAt" || key === "deliveredAt") {
      const s = String(body[key]);
      // Cap to plausible 24h window so a client can't backdate or forward-date wildly.
      const t = Date.parse(s);
      if (!isNaN(t) && Math.abs(t - Date.now()) < 24 * 3600 * 1000) patch[key] = s;
    }
  }

  const updated = { ...order, ...patch };
  await setOrder(id, updated);
  return NextResponse.json({ order: publicOrder(updated) });
}
