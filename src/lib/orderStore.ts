export type OrderStatus = "pending" | "claimed" | "picked_up" | "delivered";

export type Order = {
  id: string;
  status: OrderStatus;
  hall: string;
  hallEmoji: string;
  hallCollege: string;
  cart: string[];
  pid_last4: string | null;
  pickup_time: string | null;
  order_number: string;
  total: string;
  building: string;
  deliveryCollege: string;
  room: string | null;
  toDoor: boolean;
  dasherName?: string;
  dasherTransport?: string;
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

declare global {
  // eslint-disable-next-line no-var
  var _orderStore: Map<string, Order> | undefined;
}

// Persist across hot-reloads in development
export const orderStore: Map<string, Order> =
  global._orderStore ?? (global._orderStore = new Map());
