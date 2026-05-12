// Haversine distance in km between two GPS points
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

// Estimated delivery time in minutes given transport mode
export function etaMinutes(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
  transport: string,
): number {
  const km = haversineKm(fromLat, fromLng, toLat, toLng);
  const speedKmh = transport === "scooter" ? 15 : 10;
  return Math.max(1, Math.round((km / speedKmh) * 60));
}

// ── Dining Hall Hours ────────────────────────────────────────────────────────
// Each entry: [openHour, openMin, closeHour, closeMin] per day-of-week bucket
// Bucket 0 = Mon–Fri, Bucket 1 = Sat–Sun
type HourRange = [number, number, number, number]; // [openH, openM, closeH, closeM]
type HallSchedule = { weekday: HourRange; weekend: HourRange | null };

const HALL_SCHEDULES: Record<string, HallSchedule> = {
  "64deg":    { weekday: [7, 0, 21, 0], weekend: [9, 0, 20, 0] },
  "pines":    { weekday: [7, 0, 21, 0], weekend: [9, 0, 20, 0] },
  "sixth":    { weekday: [7, 0, 23, 0], weekend: [8, 0, 23, 0] },
  "ovt":      { weekday: [7, 0, 21, 0], weekend: [9, 0, 20, 0] },
  "ventanas": { weekday: [7, 0, 22, 0], weekend: [9, 0, 20, 0] },
  "canyon":   { weekday: [7, 0, 21, 0], weekend: [10, 0, 20, 0] },
  "bistro":   { weekday: [7, 0, 20, 0], weekend: [10, 0, 16, 0] },
};

function minutesNow(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function isWeekend(): boolean {
  const day = new Date().getDay(); // 0=Sun, 6=Sat
  return day === 0 || day === 6;
}

export function isHallOpen(hallId: string): boolean {
  // Demo override: NEXT_PUBLIC_DEMO_MODE forces a small set of halls open so
  // pitches don't fall flat at off-hours.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" && DEMO_OPEN_HALLS.has(hallId)) return true;
  const sched = HALL_SCHEDULES[hallId];
  if (!sched) return true;
  const range = isWeekend() ? sched.weekend : sched.weekday;
  if (!range) return false;
  const now = minutesNow();
  const open = range[0] * 60 + range[1];
  const close = range[2] * 60 + range[3];
  return now >= open && now < close;
}

const DEMO_OPEN_HALLS = new Set(["64deg", "pines"]);

export function hallOpenLabel(hallId: string): string {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" && DEMO_OPEN_HALLS.has(hallId)) return "Open";
  const sched = HALL_SCHEDULES[hallId];
  if (!sched) return "Open";
  const range = isWeekend() ? sched.weekend : sched.weekday;
  if (!range) return "Closed today";
  const now = minutesNow();
  const open = range[0] * 60 + range[1];
  const close = range[2] * 60 + range[3];
  if (now < open) {
    const fmt = (h: number, m: number) =>
      `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""}${h < 12 ? "am" : "pm"}`;
    return `Opens ${fmt(range[0], range[1])}`;
  }
  if (now >= close) return "Closed";
  const remaining = close - now;
  if (remaining <= 60) return `Closes in ${remaining}m`;
  return "Open";
}

// ── College Themes ───────────────────────────────────────────────────────────
export type CollegeTheme = {
  accent: string;       // primary color (header bg, buttons)
  gold: string;         // secondary accent (CTA buttons)
  chip: string;         // pill/chip background
  chipText: string;     // pill/chip text
  avatarBg: string;
  avatarText: string;
  label: string;
};

export const COLLEGE_THEMES: Record<string, CollegeTheme> = {
  "Revelle College":   { accent: "#003087", gold: "#F5B700", chip: "#E8F0F9", chipText: "#003087", avatarBg: "#F5B700", avatarText: "#003087", label: "Revelle" },
  "Muir College":      { accent: "#1B5E20", gold: "#66BB6A", chip: "#E8F5E9", chipText: "#1B5E20", avatarBg: "#66BB6A", avatarText: "#1B5E20", label: "Muir" },
  "Marshall College":  { accent: "#006064", gold: "#26C6DA", chip: "#E0F7FA", chipText: "#006064", avatarBg: "#26C6DA", avatarText: "#006064", label: "Marshall" },
  "Warren College":    { accent: "#4A148C", gold: "#CE93D8", chip: "#F3E5F5", chipText: "#4A148C", avatarBg: "#CE93D8", avatarText: "#4A148C", label: "Warren" },
  "Roosevelt College": { accent: "#B71C1C", gold: "#EF9A9A", chip: "#FFEBEE", chipText: "#B71C1C", avatarBg: "#EF9A9A", avatarText: "#B71C1C", label: "Roosevelt" },
  "Sixth College":     { accent: "#01579B", gold: "#4FC3F7", chip: "#E1F5FE", chipText: "#01579B", avatarBg: "#4FC3F7", avatarText: "#01579B", label: "Sixth" },
  "Seventh College":   { accent: "#1A237E", gold: "#9FA8DA", chip: "#E8EAF6", chipText: "#1A237E", avatarBg: "#9FA8DA", avatarText: "#1A237E", label: "Seventh" },
  "Eighth College":    { accent: "#880E4F", gold: "#F48FB1", chip: "#FCE4EC", chipText: "#880E4F", avatarBg: "#F48FB1", avatarText: "#880E4F", label: "Eighth" },
};

const DEFAULT_THEME: CollegeTheme = COLLEGE_THEMES["Revelle College"];

export function getCollegeTheme(college: string | null | undefined): CollegeTheme {
  if (!college) return DEFAULT_THEME;
  return COLLEGE_THEMES[college] ?? DEFAULT_THEME;
}
