// src/lib/pricing.ts
// Dorm Dash pricing engine — 7 dining halls, 8 colleges.
// Delivery mode: scooter / bike (all orders).
// Minimum floor: $4 total.

export type HallId =
  | 'pines'
  | 'ventanas'
  | 'sixty4'
  | 'ovt'
  | 'canyon'
  | 'bistro'
  | 'sixthDining';

export type CollegeId =
  | 'seventh'
  | 'erc'
  | 'sixth'
  | 'marshall'
  | 'warren'
  | 'muir'
  | 'revelle'
  | 'eighth';

export type DistanceTier = 'close' | 'medium' | 'far';

export const DELIVERY_MODE = 'scooter/bike' as const;

export const DINING_HALLS: Record<
  HallId,
  { name: string; homeCollege: CollegeId }
> = {
  pines:       { name: 'Pines',              homeCollege: 'muir' },
  ventanas:    { name: 'Cafe Ventanas',      homeCollege: 'erc' },
  sixty4:      { name: '64 Degrees',         homeCollege: 'revelle' },
  ovt:         { name: 'Ocean View Terrace', homeCollege: 'marshall' },
  canyon:      { name: 'Canyon Vista',       homeCollege: 'warren' },
  bistro:      { name: 'Bistro',             homeCollege: 'seventh' },
  sixthDining: { name: 'Sixth Dining',       homeCollege: 'sixth' },
};

export const COLLEGES: Record<CollegeId, { name: string }> = {
  seventh:  { name: 'Seventh' },
  erc:      { name: 'ERC' },
  sixth:    { name: 'Sixth' },
  marshall: { name: 'Marshall' },
  warren:   { name: 'Warren' },
  muir:     { name: 'Muir' },
  revelle:  { name: 'Revelle' },
  eighth:   { name: 'Eighth' },
};

export const DISTANCE_TIERS: Record<
  HallId,
  Record<DistanceTier, CollegeId[]>
> = {
  pines: {
    close:  ['muir', 'revelle'],
    medium: ['marshall', 'sixth', 'warren', 'eighth'],
    far:    ['erc', 'seventh'],
  },
  ventanas: {
    close:  ['erc', 'seventh', 'sixth'],
    medium: ['marshall', 'muir'],
    far:    ['warren', 'revelle', 'eighth'],
  },
  sixty4: {
    close:  ['revelle', 'muir', 'eighth'],
    medium: ['marshall'],
    far:    ['erc', 'seventh', 'warren', 'sixth'],
  },
  ovt: {
    close:  ['marshall', 'warren', 'sixth'],
    medium: ['erc', 'muir'],
    far:    ['seventh', 'revelle', 'eighth'],
  },
  canyon: {
    close:  [],
    medium: ['warren', 'marshall', 'sixth', 'muir'],
    far:    ['erc', 'seventh', 'revelle', 'eighth'],
  },
  bistro: {
    close:  ['seventh', 'erc'],
    medium: ['sixth', 'marshall', 'muir'],
    far:    ['warren', 'revelle', 'eighth'],
  },
  sixthDining: {
    close:  ['sixth', 'erc'],
    medium: ['seventh', 'marshall', 'muir', 'warren', 'revelle', 'eighth'],
    far:    [],
  },
};

export const PRICING = {
  foodItem:     2.00,
  drinkItem:    0.50,
  minTotal:     4.00,
  roomDelivery: 2.00,
  // Dasher receives this fraction of (deliveryFee + roomFee), with a hard floor below.
  // Platform keeps the rest. The floor exists because no one will accept a sub-$2 trip.
  dasherPayoutRatio: 0.75,
  dasherPayoutFloor: 2.00,
  // Commission paid by HDH to the platform on the food subtotal of every delivered order.
  // Per-hall override allows different rates as we negotiate (see HALL_COMMISSION).
  hdhCommissionDefault: 0.10,
  // Estimated CO2 saved per delivery vs. the student driving themselves to the dining
  // hall in a 25 mpg ICE car. ~1.5 mi round trip @ 19.6 lb CO2/gal of gasoline.
  carbonSavedLbsPerOrder: 1.18,
  delivery: {
    close:  { floor: 2.00, rate: 0.25 },
    medium: { floor: 2.00, rate: 0.30 },
    far:    { floor: 2.00, rate: 0.35 },
  },
} as const;

// Per-hall commission overrides. Defaults to PRICING.hdhCommissionDefault when omitted.
// HDH may want different rates for high-margin halls vs. low-margin ones.
export const HALL_COMMISSION: Partial<Record<HallId, number>> = {
  // Example: pines: 0.12, sixthDining: 0.08
};

export function getCommissionRate(hall: HallId): number {
  return HALL_COMMISSION[hall] ?? PRICING.hdhCommissionDefault;
}

export function getDistanceTier(
  hall: HallId,
  college: CollegeId
): DistanceTier {
  const tiers = DISTANCE_TIERS[hall];
  if (tiers.close.includes(college))  return 'close';
  if (tiers.medium.includes(college)) return 'medium';
  return 'far';
}

export function getDeliveryFee(
  tier: DistanceTier,
  subtotal: number
): number {
  const t = PRICING.delivery[tier];
  return round2(Math.max(t.floor, subtotal * t.rate));
}

export interface OrderInput {
  hall: HallId;
  college: CollegeId;
  foodItems: number;
  drinkItems: number;
  deliverToRoom: boolean;
  // ADA-registered students pay no delivery or room fee. Verified server-side via SSO claim
  // in production; for now the client passes the flag from the user's profile.
  adaFreeDelivery?: boolean;
}

export interface OrderBreakdown {
  tier: DistanceTier;
  foodFee: number;
  drinkFee: number;
  subtotal: number;
  deliveryFee: number;
  roomFee: number;
  total: number;
  meetsMinimum: boolean;
  minimumShortfall: number;
  commission: number;
  carbonSavedLbs: number;
  adaFreeDelivery: boolean;
}

export function calculateOrder(input: OrderInput): OrderBreakdown {
  const tier        = getDistanceTier(input.hall, input.college);
  const foodFee     = round2(input.foodItems * PRICING.foodItem);
  const drinkFee    = round2(input.drinkItems * PRICING.drinkItem);
  const subtotal    = round2(foodFee + drinkFee);
  const adaFree     = !!input.adaFreeDelivery;
  const deliveryFee = adaFree ? 0 : getDeliveryFee(tier, subtotal);
  const roomFee     = adaFree ? 0 : (input.deliverToRoom ? PRICING.roomDelivery : 0);
  const total       = round2(subtotal + deliveryFee + roomFee);
  const meetsMinimum     = total >= PRICING.minTotal;
  const minimumShortfall = round2(Math.max(0, PRICING.minTotal - total));
  const commission       = round2(subtotal * getCommissionRate(input.hall));
  return {
    tier, foodFee, drinkFee, subtotal,
    deliveryFee, roomFee, total,
    meetsMinimum, minimumShortfall,
    commission,
    carbonSavedLbs: PRICING.carbonSavedLbsPerOrder,
    adaFreeDelivery: adaFree,
  };
}

// Pilot mode — when set, only orders to whitelisted buildings are accepted.
// Set NEXT_PUBLIC_PILOT_BUILDINGS to a comma-separated list (e.g. "Catalyst Hall,Mosaic Hall")
// to limit the live deployment to a small test cohort during the HDH pilot.
export function getPilotBuildings(): string[] {
  const raw = process.env.NEXT_PUBLIC_PILOT_BUILDINGS ?? "";
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}

export function isBuildingInPilot(building: string): boolean {
  const pilot = getPilotBuildings();
  return pilot.length === 0 || pilot.includes(building);
}

// 75% of the fees the student paid for getting it there, with a $2 floor so
// short/cheap trips remain worth accepting. Single source of truth — both the
// dasher delivery screen and any earnings UI should call this so a future
// ratio/floor change touches one place.
export function dasherEarning(deliveryFee: number, roomFee: number): number {
  const share = (deliveryFee + roomFee) * PRICING.dasherPayoutRatio;
  return round2(Math.max(PRICING.dasherPayoutFloor, share));
}

export function formatUSD(n: number): string {
  return `$${n.toFixed(2)}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
