const validTokens = new Set<string>();

export function createAdminToken(): string {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  validTokens.add(token);
  // Auto-expire after 24 hours
  setTimeout(() => validTokens.delete(token), 24 * 60 * 60 * 1000);
  return token;
}

export function isValidAdminToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string" || token.length < 10) return false;
  return validTokens.has(token);
}
