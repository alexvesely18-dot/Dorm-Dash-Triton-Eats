import { NextRequest, NextResponse } from "next/server";

// Edge middleware. Runs before any route handler. Three jobs:
//   1. Short-circuit obvious-abuse paths (.env, wp-admin, .git, etc.) so we don't
//      waste CPU on bots.
//   2. Block over-sized POST bodies before Next.js parses them.
//   3. Tag every request with a short correlation id so support can grep logs.

const BANNED_PATH_PATTERNS = [
  /^\/\.env/i,
  /^\/wp-(?:admin|login|content)/i,
  /^\/\.git/i,
  /^\/\.aws/i,
  /^\/\.ssh/i,
  /^\/phpmyadmin/i,
  /^\/admin\.php/i,
  /^\/xmlrpc\.php/i,
  /\.(?:php|aspx)$/i,
];

const MAX_BODY_BYTES = 12_000_000; // 12 MB — the OCR endpoint accepts up to 10 MB base64.

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (BANNED_PATH_PATTERNS.some((p) => p.test(pathname))) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
  }

  const res = NextResponse.next();
  // Short, non-secret correlation id for log triage.
  res.headers.set("x-request-id", Math.random().toString(36).slice(2, 10));
  return res;
}

// Apply to everything except Next.js static internals and the favicon.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
