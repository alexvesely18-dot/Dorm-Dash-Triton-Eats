interface RateWindow {
  count: number;
  resetAt: number;
}

const windows = new Map<string, RateWindow>();

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
