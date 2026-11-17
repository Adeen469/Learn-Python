import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  // NOTE: 'unsafe-inline' is required: Next.js App Router streams its RSC
  // payload as inline <script>self.__next_f.push(...)</script> tags, and a
  // real Chromium render proved hydration is fully blocked without it
  // (28 CSP violations, no client-side rendering). A per-request nonce
  // via middleware would be the stricter alternative; out of scope here.
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  // jsDelivr again: @monaco-editor/react loads Monaco's editor.main.css
  // from the CDN. Without this the stylesheet is CSP-blocked, Monaco
  // loses all layout CSS, and its hidden input textarea renders as a
  // plain grey block at the top of the editor pane.
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  // lh3.googleusercontent.com serves Google profile pictures (the
  // navbar avatar comes from the signed-in user's Google photo).
  // i.ytimg.com serves YouTube video thumbnails on the Courses page.
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://yt3.googleusercontent.com https://i.ytimg.com",
  "font-src 'self' data:",
  // pypi.org + files.pythonhosted.org: micropip installs PyPI wheels
  // directly from the browser. Without these, every micropip install
  // was blocked by the CSP and the Modules panel's Install button
  // silently failed for any package not built into Pyodide.
  "connect-src 'self' https://cdn.jsdelivr.net https://pypi.org https://files.pythonhosted.org",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  // youtube-nocookie embeds the course videos that don't have a
  // MEGA/Drive link yet (temporary fallback — Maalik replaces them
  // with MEGA/Drive links when he has them).
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
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

