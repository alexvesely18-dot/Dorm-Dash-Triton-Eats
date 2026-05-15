interface RateWindow {
  count: number;
  resetAt: number;
}

// In-memory window store. On serverless, this is per-instance and approximate —
// a known limitation. The size cap below prevents an unbounded leak if a single
// instance stays warm and serves a large unique-IP cohort.
const windows = new Map<string, RateWindow>();
const MAX_ENTRIES = 10_000;

/**
 * Returns true if the request is allowed, false if rate-limited.
 * limit: max requests per window
 * windowMs: window duration in milliseconds
 */
export function rateLimit(
  ip: string,
  endpoint: string,
  limit: number,
  windowMs: number
): boolean {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const w = windows.get(key);

  if (!w || now > w.resetAt) {
    // Lazy GC: when the Map gets large, sweep expired entries to keep memory bounded.
    if (windows.size >= MAX_ENTRIES) {
      for (const [k, v] of windows) {
        if (now > v.resetAt) windows.delete(k);
      }
      // If GC didn't shrink it (unlikely but possible if all entries are fresh),
      // drop the oldest to make room. This trades correctness for memory safety
      // — at >10k unique limiter keys per instance you're already under attack.
      if (windows.size >= MAX_ENTRIES) {
        const firstKey = windows.keys().next().value;
        if (firstKey !== undefined) windows.delete(firstKey);
      }
    }
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (w.count >= limit) return false;
  w.count++;
  return true;
}

/** Extract best-effort client IP from Next.js request headers. */
export function getIp(req: { headers: { get(name: string): string | null } }): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
