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
  // Food is paid to HDH via Triton2Go — the platform never charges for food and does not
  // display item prices anywhere in the UI. Only delivery + room fees are platform revenue.
  roomDelivery: 2.00,
  // Dasher receives this fraction of (deliveryFee + roomFee), with a hard floor below.
  // Platform keeps the rest. The floor exists because no one will accept a sub-$2 trip.
  dasherPayoutRatio: 0.75,
  dasherPayoutFloor: 2.00,
  // Commission paid by HDH to the platform on the Triton2Go food subtotal we capture
  // from the receipt OCR. When we can't read the receipt, commission for that order is 0.
  // Per-hall override via HALL_COMMISSION.
  hdhCommissionDefault: 0.10,
  // Estimated CO2 saved per delivery vs. the student driving themselves to the dining
  // hall in a 25 mpg ICE car. ~1.5 mi round trip @ 19.6 lb CO2/gal of gasoline.
  carbonSavedLbsPerOrder: 1.18,
  // Flat delivery fee per distance tier. Doesn't scale with food cost because the
  // platform doesn't see or care about food cost.
  delivery: {
    close:  2.00,
    medium: 2.50,
    far:    3.00,
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

export function getDeliveryFee(tier: DistanceTier): number {
  return PRICING.delivery[tier];
}

export interface OrderInput {
  hall: HallId;
  college: CollegeId;
  deliverToRoom: boolean;
  // ADA-registered students pay no delivery or room fee. Verified server-side via SSO claim
  // in production; for now the client passes the flag from the user's profile.
  adaFreeDelivery?: boolean;
  // OCR-captured Triton2Go receipt total, used for HDH commission reporting only.
  // Never displayed in the user-facing app. When unknown, commission is 0.
  receiptTotal?: number;
}

export interface OrderBreakdown {
  tier: DistanceTier;
  deliveryFee: number;
  roomFee: number;
  total: number;
  commission: number;
  carbonSavedLbs: number;
  adaFreeDelivery: boolean;
  receiptTotal: number;
}

export function calculateOrder(input: OrderInput): OrderBreakdown {
  const tier         = getDistanceTier(input.hall, input.college);
  const adaFree      = !!input.adaFreeDelivery;
  const deliveryFee  = adaFree ? 0 : getDeliveryFee(tier);
  const roomFee      = adaFree ? 0 : (input.deliverToRoom ? PRICING.roomDelivery : 0);
  const total        = round2(deliveryFee + roomFee);
  const receiptTotal = Number.isFinite(input.receiptTotal) && (input.receiptTotal ?? 0) > 0
    ? round2(input.receiptTotal as number)
    : 0;
  const commission   = round2(receiptTotal * getCommissionRate(input.hall));
  return {
    tier,
    deliveryFee, roomFee, total,
    commission,
    carbonSavedLbs: PRICING.carbonSavedLbsPerOrder,
    adaFreeDelivery: adaFree,
    receiptTotal,
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
