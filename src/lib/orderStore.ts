export type OrderStatus = "pending" | "claimed" | "picked_up" | "delivered";

export type Order = {
  id: string;
  status: OrderStatus;
  hall: string;
  hallEmoji: string;
  hallCollege: string;
  hallLat: number;
  hallLng: number;
  cart: string[];
  pid_last4: string | null;
  pickup_time: string | null;
  order_number: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  tier: 'close' | 'medium' | 'far';
  building: string;
  deliveryCollege: string;
  destLat: number;
  destLng: number;
  room: string | null;
  toDoor: boolean;
  dasherName?: string;
  dasherTransport?: string;
  dasherLat?: number;
  dasherLng?: number;
  createdAt: string;
  claimedAt?: string;
  scheduledFor?: string;
  batched?: boolean;
  batchDasher?: string;
  messages?: { from: string; text: string; at: string }[];
};

// All residential buildings grouped by college — used in signup, profile, and order pages
export const BUILDINGS_BY_COLLEGE: Record<string, string[]> = {
  "Revelle College":   ["Tioga Hall", "Tenaya Hall", "Tahoe Hall", "Shasta Hall"],
  "Muir College":      ["Matthews Hall", "Muir Apartments"],
  "Marshall College":  ["Marshall Upper Apartments", "Marshall Lower Apartments"],
  "Warren College":    ["Warren Apartments", "Pepper Canyon Hall"],
  "Roosevelt College": ["Cuicacalli", "Anza Hall", "De Anza Hall", "Rita Atkinson Residences"],
  "Sixth College":     ["Mesa Nueva", "North Mesa Apartments"],
  "Seventh College":   ["West Tower", "East Tower", "Eco Flats", "Mesa South"],
  "Eighth College":    ["Nuevo East", "Nuevo West"],
};

// Map each building to the college that owns it — used to gate door-delivery claims
export const BUILDING_COLLEGE: Record<string, string> = {
  // Revelle
  "Tioga Hall":                  "Revelle College",
  "Tenaya Hall":                 "Revelle College",
  "Tahoe Hall":                  "Revelle College",
  "Shasta Hall":                 "Revelle College",
  // Muir
  "Matthews Hall":               "Muir College",
  "Muir Apartments":             "Muir College",
  // Marshall
  "Marshall Upper Apartments":   "Marshall College",
  "Marshall Lower Apartments":   "Marshall College",
  // Warren
  "Warren Apartments":           "Warren College",
  "Pepper Canyon Hall":          "Warren College",
  // Roosevelt
  "Cuicacalli":                  "Roosevelt College",
  "Anza Hall":                   "Roosevelt College",
  "De Anza Hall":                "Roosevelt College",
  "Rita Atkinson Residences":    "Roosevelt College",
  // Sixth
  "Mesa Nueva":                  "Sixth College",
  "North Mesa Apartments":       "Sixth College",
  // Seventh
  "West Tower":                  "Seventh College",
  "East Tower":                  "Seventh College",
  "Eco Flats":                   "Seventh College",
  "Mesa South":                  "Seventh College",
  // Eighth
  "Nuevo East":                  "Eighth College",
  "Nuevo West":                  "Eighth College",
};

// Approximate GPS coordinates for each dorm building
export const BUILDING_COORDS: Record<string, { lat: number; lng: number }> = {
  // Revelle
  "Tioga Hall":                { lat: 32.8733, lng: -117.2428 },
  "Tenaya Hall":               { lat: 32.8736, lng: -117.2424 },
  "Tahoe Hall":                { lat: 32.8738, lng: -117.2420 },
  "Shasta Hall":               { lat: 32.8741, lng: -117.2416 },
  // Muir
  "Matthews Hall":             { lat: 32.8757, lng: -117.2418 },
  "Muir Apartments":           { lat: 32.8751, lng: -117.2422 },
  // Marshall
  "Marshall Upper Apartments": { lat: 32.8762, lng: -117.2408 },
  "Marshall Lower Apartments": { lat: 32.8758, lng: -117.2412 },
  // Warren
  "Warren Apartments":         { lat: 32.8836, lng: -117.2368 },
  "Pepper Canyon Hall":        { lat: 32.8826, lng: -117.2358 },
  // Roosevelt
  "Cuicacalli":                { lat: 32.8791, lng: -117.2376 },
  "Anza Hall":                 { lat: 32.8771, lng: -117.2370 },
  "De Anza Hall":              { lat: 32.8768, lng: -117.2373 },
  "Rita Atkinson Residences":  { lat: 32.8848, lng: -117.2405 },
  // Sixth
  "Mesa Nueva":                { lat: 32.8856, lng: -117.2424 },
  "North Mesa Apartments":     { lat: 32.8860, lng: -117.2420 },
  // Seventh
  "West Tower":                { lat: 32.8895, lng: -117.2403 },
  "East Tower":                { lat: 32.8893, lng: -117.2397 },
  "Eco Flats":                 { lat: 32.8888, lng: -117.2407 },
  "Mesa South":                { lat: 32.8884, lng: -117.2400 },
  // Eighth
  "Nuevo East":                { lat: 32.8914, lng: -117.2402 },
  "Nuevo West":                { lat: 32.8912, lng: -117.2410 },
};

declare global {
  // eslint-disable-next-line no-var
  var _orderStore: Map<string, Order> | undefined;
  // eslint-disable-next-line no-var
  var _orderSweepInterval: NodeJS.Timeout | undefined;
}

// Persist across hot-reloads in development
export const orderStore: Map<string, Order> =
  global._orderStore ?? (global._orderStore = new Map());

// Hourly sweep: wipe any in-progress order (pending/claimed/picked_up) older than 1 hour.
// Keeps demo state clean and prevents orphan orders from zombie clients.
const ONE_HOUR_MS = 60 * 60 * 1000;
if (!global._orderSweepInterval) {
  global._orderSweepInterval = setInterval(() => {
    const cutoff = Date.now() - ONE_HOUR_MS;
    for (const [id, order] of orderStore) {
      if (order.status === "delivered") continue;
      if (new Date(order.createdAt).getTime() < cutoff) {
        orderStore.delete(id);
      }
    }
  }, ONE_HOUR_MS);
}
