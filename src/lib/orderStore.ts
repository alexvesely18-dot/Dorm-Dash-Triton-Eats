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
  total: string;
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
};

// Map each building to the college that owns it — used to gate door-delivery claims
export const BUILDING_COLLEGE: Record<string, string> = {
  "Tioga Hall":               "Sixth College",
  "Tenaya Hall":              "Sixth College",
  "Tahoe Hall":               "Sixth College",
  "Shasta Hall":              "Sixth College",
  "Anza Hall":                "Roosevelt College",
  "De Anza Hall":             "Roosevelt College",
  "Cuicacalli":               "Muir College",
  "Matthews":                 "Revelle College",
  "Rita Atkinson Residences": "Eighth College",
  "Mesa Nueva":               "Seventh College",
  "Marshall Upper/Lower":     "Marshall College",
  "Warren Apartments":        "Warren College",
  "Revelle Dorms":            "Revelle College",
};

// Approximate GPS coordinates for each dorm building
export const BUILDING_COORDS: Record<string, { lat: number; lng: number }> = {
  "Tioga Hall":               { lat: 32.8815, lng: -117.2385 },
  "Tenaya Hall":              { lat: 32.8812, lng: -117.2388 },
  "Tahoe Hall":               { lat: 32.8809, lng: -117.2392 },
  "Shasta Hall":              { lat: 32.8806, lng: -117.2395 },
  "Anza Hall":                { lat: 32.8766, lng: -117.2367 },
  "De Anza Hall":             { lat: 32.8763, lng: -117.2370 },
  "Cuicacalli":               { lat: 32.8791, lng: -117.2376 },
  "Matthews":                 { lat: 32.8740, lng: -117.2418 },
  "Rita Atkinson Residences": { lat: 32.8848, lng: -117.2405 },
  "Mesa Nueva":               { lat: 32.8851, lng: -117.2402 },
  "Marshall Upper/Lower":     { lat: 32.8757, lng: -117.2405 },
  "Warren Apartments":        { lat: 32.8836, lng: -117.2368 },
  "Revelle Dorms":            { lat: 32.8739, lng: -117.2430 },
};

declare global {
  // eslint-disable-next-line no-var
  var _orderStore: Map<string, Order> | undefined;
}

// Persist across hot-reloads in development
export const orderStore: Map<string, Order> =
  global._orderStore ?? (global._orderStore = new Map());
