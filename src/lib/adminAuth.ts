import { redis } from "./redis";
import { timingSafeEqual, randomBytes, createHmac } from "node:crypto";

// Admin authentication is distributed via Redis so tokens survive serverless cold
// starts and work across multiple function instances. The previous in-memory Set
// only worked for a single warm container.

const TOKEN_PREFIX = "adminTok:";
const TTL_SECONDS = 24 * 60 * 60; // 24h

/** Issue a fresh admin token, store its hash in Redis with TTL, return the token. */
export async function createAdminToken(): Promise<string> {
  const token = randomBytes(24).toString("hex");
  await redis.set(`${TOKEN_PREFIX}${hashToken(token)}`, "1", { ex: TTL_SECONDS });
  return token;
}

/** Validate an incoming token against Redis. Tokens are stored as HMACs of themselves
 *  using a per-deployment pepper so a leaked Redis snapshot doesn't expose tokens. */
export async function isValidAdminToken(token: string | null | undefined): Promise<boolean> {
  if (!token || typeof token !== "string" || token.length < 10 || token.length > 128) return false;
  // Reject any non-hex tokens up front to keep the Redis key namespace clean.
  if (!/^[a-f0-9]+$/i.test(token)) return false;
  const exists = await redis.get(`${TOKEN_PREFIX}${hashToken(token)}`);
  return exists === "1" || exists === 1;
}

/** Revoke a token explicitly (used on logout). */
export async function revokeAdminToken(token: string): Promise<void> {
  if (!token || !/^[a-f0-9]+$/i.test(token)) return;
  await redis.del(`${TOKEN_PREFIX}${hashToken(token)}`);
}

/** Constant-time string equality, safe to use on user-controlled inputs. */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) {
    // Always perform a same-size compare to keep timing uniform; result is ignored.
    timingSafeEqual(aBuf, Buffer.alloc(aBuf.length));
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

function hashToken(token: string): string {
  // ADMIN_TOKEN_PEPPER is server-side only; without it we still hash but with a
  // constant placeholder so dev works. Always set this env var in production.
  const pepper = process.env.ADMIN_TOKEN_PEPPER ?? "dev-pepper-not-for-prod";
  return createHmac("sha256", pepper).update(token).digest("hex");
}
