import type { NextConfig } from "next";

// Production-grade security headers applied to every response. None of these
// are silver bullets — they're a low-cost baseline that closes the easy holes
// (clickjacking, MIME sniffing, referer leakage, unsanctioned third-party
// frames, mixed content) before deeper hardening like SSO and CSRF tokens
// land in Phase 2.
const securityHeaders = [
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy",        value: "camera=(self), microphone=(), geolocation=(self), payment=()" },
  // Leaflet map tiles come from OpenStreetMap; image data may also come from blob: URLs
  // for the OCR pre-upload preview. unsafe-inline on style is required for Tailwind's JIT
  // class strings and inline icon SVGs. Tighten in Phase 2 once we ship nonces.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob: https://*.openstreetmap.org https://*.tile.openstreetmap.org",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' https://*.upstash.io https://*.openstreetmap.org",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
