import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  // NOTE: 'unsafe-inline' is required: Next.js App Router streams its RSC
  // payload as inline <script>self.__next_f.push(...)</script> tags, and a
  // real Chromium render proved hydration is fully blocked without it
  // (28 CSP violations, no client-side rendering). A per-request nonce
  // via middleware would be the stricter alternative; out of scope here.
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline'",
  // lh3.googleusercontent.com serves Google profile pictures (the
  // navbar avatar comes from the signed-in user's Google photo).
  "img-src 'self' data: blob: https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://cdn.jsdelivr.net",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Produces a minimal self-contained server (.next/standalone/server.js)
  // so the app can run on Fly.io from a plain `node server.js`.
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

