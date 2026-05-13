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
  // Total amount the student paid the platform — just delivery + room fees. Food cost is
  // paid separately to the dining hall via Triton2Go and is not part of this number.
  total: number;
  deliveryFee: number;
  roomFee: number;
  // Triton2Go receipt total captured from the OCR. Stored as an analytics metric of the
  // food revenue Dorm Dash drove for UCSD dining; never displayed to the student or dasher.
  receiptTotal?: number;
  // Lbs of CO2 saved vs. the student driving themselves; used for sustainability counters.
  carbonSavedLbs?: number;
  // True if the student was ADA-verified; deliveryFee+roomFee are zero in this case.
  adaFreeDelivery?: boolean;
  // Student-facing post-delivery survey.
  studentRating?: number;
  studentRatingComment?: string;
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
  pickedUpAt?: string;
  deliveredAt?: string;
  scheduledFor?: string;
  batched?: boolean;
  batchDasher?: string;
  messages?: { from: string; text: string; at: string }[];
};

// All residential buildings grouped by college — used in signup, profile, and order pages
export const BUILDINGS_BY_COLLEGE: Record<string, string[]> = {
  "Revelle College": [
    "Argo Hall", "Blake Hall",
    "Atlantis Hall", "Beagle Hall", "Challenger Hall", "Discovery Hall", "Galathea Hall", "Meteor Hall",
    "Keeling Apartments",
  ],
  "Muir College": [
    "Tioga Hall", "Tenaya Hall", "Tuolumne Apartments", "Tamarack Apartments",
  ],
  "Marshall College": [
    "Alianza Hall", "Umoja Hall", "Coalition Hall",
  ],
  "Warren College": [
    "Frankfurter Hall", "Harlan Hall", "Stewart Hall",
    "Bates Hall", "Black Hall", "Brennan Hall", "Brown Hall", "Douglas Hall", "Goldberg Hall",
  ],
  "Roosevelt College": [
    "Africa Hall", "Asia Hall", "Europe Hall", "Latin America Hall", "North America Hall",
    "Earth Hall", "Middle East Hall", "Oceania Hall", "Mesa Verde Hall",
    "International House (I-House)",
  ],
  "Sixth College": [
    "Catalyst Hall", "Kaleidoscope Hall", "Mosaic Hall", "Tapestry Hall",
  ],
  // Seventh College Living-Learning Neighborhood — official building names from
  // seventh.ucsd.edu/about/building-names. Unannounced buildings retain the
  // "Building N <side>" placeholder; replace once UCSD publishes the names.
  "Seventh College": [
    "North Star (Bldg 1 West)",
    "Hyperion (Bldg 1 East)",
    "Building 2 West",
    "Borrego (Bldg 2 East)",
    "Amanecer (Bldg 3 West)",
    "Quino (Bldg 3 East)",
    "Solstice (Bldg 4 West)",
    "Thornmint (Bldg 4 East)",
    "Eventide (Bldg 5 West)",
    "Vireo (Bldg 5 East)",
    "Building 6 West",
    "Chaparral (Bldg 6 East)",
    "Building 7 West",
    "Building 7 East",
    "Building 8 West",
    "Building 8 East",
  ],
  "Eighth College": [
    "Pulse", "Podemos", "Survivance", "Azad Hall", "Sankofa",
  ],
  "Village / Other": [
    "Pepper Canyon East", "Pepper Canyon West – Rya Tower", "Pepper Canyon West – Vela Tower",
    "Matthews Apartments", "Rita Atkinson Residences",
    "Nuevo East", "Nuevo West", "One Miramar Street",
  ],
};

// Map each building to the college that owns it — used to gate door-delivery claims
export const BUILDING_COLLEGE: Record<string, string> = {
  // Revelle
  "Argo Hall":                           "Revelle College",
  "Blake Hall":                          "Revelle College",
  "Atlantis Hall":                       "Revelle College",
  "Beagle Hall":                         "Revelle College",
  "Challenger Hall":                     "Revelle College",
  "Discovery Hall":                      "Revelle College",
  "Galathea Hall":                       "Revelle College",
  "Meteor Hall":                         "Revelle College",
  "Keeling Apartments":                  "Revelle College",
  // Muir
  "Tioga Hall":                          "Muir College",
  "Tenaya Hall":                         "Muir College",
  "Tuolumne Apartments":                 "Muir College",
  "Tamarack Apartments":                 "Muir College",
  // Marshall
  "Alianza Hall":                        "Marshall College",
  "Umoja Hall":                          "Marshall College",
  "Coalition Hall":                      "Marshall College",
  // Warren
  "Frankfurter Hall":                    "Warren College",
  "Harlan Hall":                         "Warren College",
  "Stewart Hall":                        "Warren College",
  "Bates Hall":                          "Warren College",
  "Black Hall":                          "Warren College",
  "Brennan Hall":                        "Warren College",
  "Brown Hall":                          "Warren College",
  "Douglas Hall":                        "Warren College",
  "Goldberg Hall":                       "Warren College",
  // Roosevelt
  "Africa Hall":                         "Roosevelt College",
  "Asia Hall":                           "Roosevelt College",
  "Europe Hall":                         "Roosevelt College",
  "Latin America Hall":                  "Roosevelt College",
  "North America Hall":                  "Roosevelt College",
  "Earth Hall":                          "Roosevelt College",
  "Middle East Hall":                    "Roosevelt College",
  "Oceania Hall":                        "Roosevelt College",
  "Mesa Verde Hall":                     "Roosevelt College",
  "International House (I-House)":       "Roosevelt College",
  // Sixth
  "Catalyst Hall":                       "Sixth College",
  "Kaleidoscope Hall":                   "Sixth College",
  "Mosaic Hall":                         "Sixth College",
  "Tapestry Hall":                       "Sixth College",
  // Seventh
  "North Star (Bldg 1 West)":            "Seventh College",
  "Hyperion (Bldg 1 East)":              "Seventh College",
  "Building 2 West":                     "Seventh College",
  "Borrego (Bldg 2 East)":               "Seventh College",
  "Amanecer (Bldg 3 West)":              "Seventh College",
  "Quino (Bldg 3 East)":                 "Seventh College",
  "Solstice (Bldg 4 West)":              "Seventh College",
  "Thornmint (Bldg 4 East)":             "Seventh College",
  "Eventide (Bldg 5 West)":              "Seventh College",
  "Vireo (Bldg 5 East)":                 "Seventh College",
  "Building 6 West":                     "Seventh College",
  "Chaparral (Bldg 6 East)":             "Seventh College",
  "Building 7 West":                     "Seventh College",
  "Building 7 East":                     "Seventh College",
  "Building 8 West":                     "Seventh College",
  "Building 8 East":                     "Seventh College",
  // Eighth
  "Pulse":                               "Eighth College",
  "Podemos":                             "Eighth College",
  "Survivance":                          "Eighth College",
  "Azad Hall":                           "Eighth College",
  "Sankofa":                             "Eighth College",
  // Village / Other
  "Pepper Canyon East":                  "",
  "Pepper Canyon West – Rya Tower":      "",
  "Pepper Canyon West – Vela Tower":     "",
  "Matthews Apartments":                 "",
  "Rita Atkinson Residences":            "",
  "Nuevo East":                          "",
  "Nuevo West":                          "",
  "One Miramar Street":                  "",
};

// GPS coordinates for each dorm building (approximate, sourced from UCSD campus map)
export const BUILDING_COORDS: Record<string, { lat: number; lng: number }> = {
  // Revelle College
  "Argo Hall":                          { lat: 32.8718, lng: -117.2412 },
  "Blake Hall":                         { lat: 32.8721, lng: -117.2408 },
  "Atlantis Hall":                      { lat: 32.8726, lng: -117.2414 },
  "Beagle Hall":                        { lat: 32.8724, lng: -117.2416 },
  "Challenger Hall":                    { lat: 32.8722, lng: -117.2416 },
  "Discovery Hall":                     { lat: 32.8720, lng: -117.2418 },
  "Galathea Hall":                      { lat: 32.8718, lng: -117.2416 },
  "Meteor Hall":                        { lat: 32.8716, lng: -117.2414 },
  "Keeling Apartments":                 { lat: 32.8710, lng: -117.2418 },
  // Muir College
  "Tioga Hall":                         { lat: 32.8760, lng: -117.2398 },
  "Tenaya Hall":                        { lat: 32.8762, lng: -117.2403 },
  "Tuolumne Apartments":                { lat: 32.8755, lng: -117.2410 },
  "Tamarack Apartments":                { lat: 32.8758, lng: -117.2406 },
  // Marshall College (Ridge Walk North LLN)
  "Alianza Hall":                       { lat: 32.8796, lng: -117.2388 },
  "Umoja Hall":                         { lat: 32.8793, lng: -117.2385 },
  "Coalition Hall":                     { lat: 32.8790, lng: -117.2382 },
  // Warren College
  "Frankfurter Hall":                   { lat: 32.8828, lng: -117.2341 },
  "Harlan Hall":                        { lat: 32.8825, lng: -117.2338 },
  "Stewart Hall":                       { lat: 32.8822, lng: -117.2335 },
  "Bates Hall":                         { lat: 32.8832, lng: -117.2330 },
  "Black Hall":                         { lat: 32.8835, lng: -117.2328 },
  "Brennan Hall":                       { lat: 32.8838, lng: -117.2325 },
  "Brown Hall":                         { lat: 32.8840, lng: -117.2322 },
  "Douglas Hall":                       { lat: 32.8842, lng: -117.2320 },
  "Goldberg Hall":                      { lat: 32.8844, lng: -117.2318 },
  // Roosevelt College (ERC)
  "Africa Hall":                        { lat: 32.8852, lng: -117.2310 },
  "Asia Hall":                          { lat: 32.8855, lng: -117.2307 },
  "Europe Hall":                        { lat: 32.8858, lng: -117.2305 },
  "Latin America Hall":                 { lat: 32.8861, lng: -117.2303 },
  "North America Hall":                 { lat: 32.8864, lng: -117.2300 },
  "Earth Hall":                         { lat: 32.8848, lng: -117.2296 },
  "Middle East Hall":                   { lat: 32.8846, lng: -117.2300 },
  "Oceania Hall":                       { lat: 32.8843, lng: -117.2303 },
  "Mesa Verde Hall":                    { lat: 32.8840, lng: -117.2305 },
  "International House (I-House)":      { lat: 32.8867, lng: -117.2296 },
  // Sixth College (North Torrey Pines LLN)
  "Catalyst Hall":                      { lat: 32.8913, lng: -117.2436 },
  "Kaleidoscope Hall":                  { lat: 32.8915, lng: -117.2442 },
  "Mosaic Hall":                        { lat: 32.8908, lng: -117.2434 },
  "Tapestry Hall":                      { lat: 32.8910, lng: -117.2440 },
  // Seventh College Living-Learning Neighborhood — paired East/West towers share
  // a footprint, so each pair gets the same approximate coordinates.
  "North Star (Bldg 1 West)":           { lat: 32.8882, lng: -117.2389 },
  "Hyperion (Bldg 1 East)":             { lat: 32.8882, lng: -117.2386 },
  "Building 2 West":                    { lat: 32.8880, lng: -117.2386 },
  "Borrego (Bldg 2 East)":              { lat: 32.8880, lng: -117.2384 },
  "Amanecer (Bldg 3 West)":             { lat: 32.8877, lng: -117.2384 },
  "Quino (Bldg 3 East)":                { lat: 32.8877, lng: -117.2382 },
  "Solstice (Bldg 4 West)":             { lat: 32.8874, lng: -117.2382 },
  "Thornmint (Bldg 4 East)":            { lat: 32.8874, lng: -117.2380 },
  "Eventide (Bldg 5 West)":             { lat: 32.8882, lng: -117.2369 },
  "Vireo (Bldg 5 East)":                { lat: 32.8882, lng: -117.2367 },
  "Building 6 West":                    { lat: 32.8879, lng: -117.2366 },
  "Chaparral (Bldg 6 East)":            { lat: 32.8879, lng: -117.2364 },
  "Building 7 West":                    { lat: 32.8876, lng: -117.2364 },
  "Building 7 East":                    { lat: 32.8876, lng: -117.2362 },
  "Building 8 West":                    { lat: 32.8873, lng: -117.2362 },
  "Building 8 East":                    { lat: 32.8873, lng: -117.2360 },
  // Eighth College (Theatre District LLN)
  "Pulse":                              { lat: 32.8700, lng: -117.2415 },
  "Podemos":                            { lat: 32.8697, lng: -117.2412 },
  "Survivance":                         { lat: 32.8695, lng: -117.2410 },
  "Azad Hall":                          { lat: 32.8693, lng: -117.2408 },
  "Sankofa":                            { lat: 32.8691, lng: -117.2406 },
  // Village / Other
  "Pepper Canyon East":                 { lat: 32.8795, lng: -117.2295 },
  "Pepper Canyon West – Rya Tower":     { lat: 32.8806, lng: -117.2290 },
  "Pepper Canyon West – Vela Tower":    { lat: 32.8802, lng: -117.2290 },
  "Matthews Apartments":                { lat: 32.8798, lng: -117.2292 },
  "Rita Atkinson Residences":           { lat: 32.8810, lng: -117.2288 },
  "Nuevo East":                         { lat: 32.8658, lng: -117.2216 },
  "Nuevo West":                         { lat: 32.8660, lng: -117.2240 },
  "One Miramar Street":                 { lat: 32.8645, lng: -117.2268 },
};

import { redis } from "./redis";

const PFX = "order:";
const TTL_ACTIVE    = 60 * 60 * 2;   // 2 hours for pending/in-progress (auto-sweep)
const TTL_DELIVERED = 60 * 60 * 24;  // 24 hours for delivered orders (admin history)

export async function getOrder(id: string): Promise<Order | null> {
  return redis.get<Order>(`${PFX}${id}`);
}

export async function setOrder(id: string, order: Order): Promise<void> {
  const ttl = order.status === "delivered" ? TTL_DELIVERED : TTL_ACTIVE;
  await redis.set(`${PFX}${id}`, order, { ex: ttl });
}

export async function deleteOrder(id: string): Promise<void> {
  await redis.del(`${PFX}${id}`);
}

export async function getAllOrders(): Promise<Order[]> {
  const keys = await redis.keys(`${PFX}*`);
  if (keys.length === 0) return [];
  const values = await redis.mget<Order[]>(...keys);
  return (values as (Order | null)[]).filter(Boolean) as Order[];
}
