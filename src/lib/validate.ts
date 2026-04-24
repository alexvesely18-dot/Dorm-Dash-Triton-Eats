/** Strip characters that could be used for script injection. */
export function sanitizeText(text: unknown, maxLen = 500): string {
  return String(text ?? "")
    .trim()
    .slice(0, maxLen)
    .replace(/[<>]/g, "");
}

/** Validate order ID format: TDE-NNNNN */
export function isValidOrderId(id: string): boolean {
  return /^TDE-\d{5}$/.test(id);
}

/** Validate that a string is one of the allowed values. */
export function isOneOf<T extends string>(value: unknown, allowed: T[]): value is T {
  return allowed.includes(value as T);
}

/** Validate base64 string size doesn't exceed limit (default 10 MB). */
export function isBase64SizeOk(base64: unknown, maxBytes = 10_000_000): boolean {
  if (typeof base64 !== "string") return false;
  // base64 encodes 3 bytes as 4 chars
  return Math.ceil((base64.length * 3) / 4) <= maxBytes;
}

/** Validated and capped positive integer. */
export function safeInt(value: unknown, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}
