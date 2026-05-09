import { NextRequest, NextResponse } from "next/server";
import { setOrder, Order, BUILDING_COORDS, BUILDING_COLLEGE } from "@/lib/orderStore";
import { isValidAdminToken } from "@/lib/adminAuth";
import { rateLimit, getIp } from "@/lib/rateLimit";
import { calculateOrder, DINING_HALLS, HallId, CollegeId, COLLEGES, PRICING } from "@/lib/pricing";

// POST /api/admin/seed-demo
// Seeds ~80 delivered orders spread over the past 14 days so the HDH Insights
// dashboard renders meaningful numbers during the pitch demo. Auth-gated; safe
// to run in production.

const HALL_IDS: HallId[] = ["pines", "ventanas", "sixty4", "ovt", "canyon", "bistro", "sixthDining"];
const COLLEGE_IDS: CollegeId[] = ["seventh", "erc", "sixth", "marshall", "warren", "muir", "revelle", "eighth"];
const BUILDINGS = Object.keys(BUILDING_COORDS);

// Realistic items + prices (all <$15)
const SAMPLE_ITEMS = [
  { name: "Chicken Fried Rice with Egg", price: 11.00, type: "food" },
  { name: "Build-Your-Own Bowl",         price:  9.50, type: "food" },
  { name: "Margherita Pizza Slice",      price:  6.50, type: "food" },
  { name: "Caesar Salad",                price:  8.00, type: "food" },
  { name: "Asada Burrito",               price: 10.50, type: "food" },
  { name: "Veggie Wrap",                 price:  7.50, type: "food" },
  { name: "Acai Bowl",                   price:  9.00, type: "food" },
  { name: "Iced Coffee",                 price:  3.50, type: "drink" },
  { name: "Bottled Water",               price:  2.00, type: "drink" },
  { name: "Boba Milk Tea",               price:  4.75, type: "drink" },
];

const FAKE_DASHERS = ["Alex T.", "Jordan K.", "Priya R.", "Sam B.", "Maya L.", "Devon C.", "Aisha N.", "Marcus P."];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  return Array.from({ length: n }, () => pick(arr));
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (!rateLimit(ip, "admin-seed", 3, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? null;
  if (!isValidAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const TARGET = 80;
  const now = Date.now();
  const ms14d = 14 * 24 * 3600 * 1000;
  let written = 0;

  for (let i = 0; i < TARGET; i++) {
    const hallId = pick(HALL_IDS);
    const collegeId = pick(COLLEGE_IDS);
    const building = pick(BUILDINGS);
    const deliveryCollege = BUILDING_COLLEGE[building] ?? "";
    const coords = BUILDING_COORDS[building] ?? { lat: 32.88, lng: -117.234 };

    // Items: 1-3 food, 0-2 drink
    const foodItems = 1 + Math.floor(Math.random() * 3);
    const drinkItems = Math.floor(Math.random() * 3);
    const cart = [
      ...pickN(SAMPLE_ITEMS.filter(i => i.type === "food"),  foodItems),
      ...pickN(SAMPLE_ITEMS.filter(i => i.type === "drink"), drinkItems),
    ];
    const cartStrings = cart.map(c => `1× ${c.name}`);

    const toDoor = Math.random() < 0.45;
    const adaFree = Math.random() < 0.06;
    const breakdown = calculateOrder({
      hall: hallId,
      college: collegeId,
      foodItems,
      drinkItems,
      deliverToRoom: toDoor,
      adaFreeDelivery: adaFree,
    });

    // Spread over the past 14 days, weighted toward recent
    const ageMs = Math.floor(Math.random() * Math.random() * ms14d);
    const placedAt = new Date(now - ageMs);
    const deliveredAt = new Date(placedAt.getTime() + (10 + Math.random() * 25) * 60 * 1000);

    // Demo orders use a high-range id (TDE-99xxx) so they're distinguishable from
    // real orders and auto-expire via the delivered-order TTL after 24h.
    const id = `TDE-${99000 + i}`;
    const dasher = pick(FAKE_DASHERS);
    const dasherTransport = Math.random() < 0.55 ? "scooter" : "bike";
    const studentRating = Math.random() < 0.85
      ? (Math.random() < 0.65 ? 5 : (Math.random() < 0.85 ? 4 : 3))
      : undefined;

    const order: Order = {
      id,
      status: "delivered",
      hall: DINING_HALLS[hallId].name,
      hallEmoji: ({ pines: "🌲", ventanas: "🌅", sixty4: "🌡️", ovt: "🌊", canyon: "🏔️", bistro: "🍽️", sixthDining: "6️⃣" } as Record<HallId, string>)[hallId],
      hallCollege: COLLEGES[DINING_HALLS[hallId].homeCollege].name,
      hallLat: 32.88, hallLng: -117.234,
      cart: cartStrings,
      pid_last4: String(Math.floor(1000 + Math.random() * 9000)),
      pickup_time: null,
      order_number: String(120000000 + Math.floor(Math.random() * 9999999)),
      subtotal:        breakdown.subtotal,
      deliveryFee:     breakdown.deliveryFee,
      roomFee:         breakdown.roomFee,
      commission:      breakdown.commission,
      carbonSavedLbs:  breakdown.carbonSavedLbs,
      adaFreeDelivery: breakdown.adaFreeDelivery,
      total:           breakdown.total,
      tier:            breakdown.tier,
      building,
      deliveryCollege,
      destLat:         coords.lat,
      destLng:         coords.lng,
      room: toDoor ? String(100 + Math.floor(Math.random() * 400)) : null,
      toDoor,
      dasherName: dasher,
      dasherTransport,
      createdAt:   placedAt.toISOString(),
      claimedAt:   new Date(placedAt.getTime() + 60_000).toISOString(),
      pickedUpAt:  new Date(placedAt.getTime() + 5 * 60_000).toISOString(),
      deliveredAt: deliveredAt.toISOString(),
      studentRating,
    };

    await setOrder(id, order);
    written++;
  }

  return NextResponse.json({
    success: true,
    written,
    summary: {
      orders: TARGET,
      approxGmv: `~$${(TARGET * 12).toFixed(0)}`,
      approxCommission: `~$${(TARGET * 12 * PRICING.hdhCommissionDefault).toFixed(2)}`,
    },
  });
}
