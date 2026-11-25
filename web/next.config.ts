import type { NextConfig } from "next";

const cspDirectives = [
  "default-src 'self'",
  // NOTE: 'unsafe-inline' is required on style-src: inline
  // style={{...}} attributes are used across the app (e.g.
  // AppNavbar, HighlightedMarkdown spans) and cannot carry a nonce.
  // script-src used to need it too: Next.js App Router streams its
  // RSC payload as inline <script>self.__next_f.push(...)</script>
  // tags, and a real Chromium render proved hydration is fully
  // blocked without it (28 CSP violations, no client-side
  // rendering). That half is now fixed with per-request nonces
  // (R2-L17): middleware.ts generates one nonce per authed page
  // request, passes it to layout.tsx via the `x-nonce` header for
  // the static theme script, and Next reads it from the CSP request
  // header for its own inline scripts — so script-src carries the
  // nonce instead of 'unsafe-inline' on the middleware-matched
  // pages, where the middleware header replaces this one. This
  // header CSP still carries 'unsafe-inline' for every route
  // middleware does not cover (landing, /auth/*, /offline,
  // /logic-builder, /modules).
  // 'wasm-unsafe-eval' is required too: Pyodide compiles/instantiates
  // its WebAssembly module via WebAssembly.instantiateStreaming(), and
  // without it the browser refuses with a CompileError ("violates the
  // following Content Security policy directive because 'unsafe-eval'
  // is not an allowed source") — the runtime download succeeds but the
  // engine never starts. This surfaced only once the runtime was
  // self-hosted (before that, the CDN download failed first, so the
  // wasm step was never reached). 'wasm-unsafe-eval' is the narrow
  // permission for wasm only; it does NOT allow arbitrary eval().
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
  // jsDelivr again: @monaco-editor/react loads Monaco's editor.main.css
  // from the CDN. Without this the stylesheet is CSP-blocked, Monaco
  // loses all layout CSS, and its hidden input textarea renders as a
  // plain grey block at the top of the editor pane.
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  // lh3.googleusercontent.com serves Google profile pictures (the
  // navbar avatar comes from the signed-in user's Google photo).
  // i.ytimg.com serves YouTube video thumbnails on the Courses page.
  // data: stays: the 2FA setup QR code is a data: URL rendered in an
  // <img> (TwoFactorSettings renders the setup route's qrDataUrl),
  // so dropping data: would break 2FA enrollment.
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://yt3.googleusercontent.com https://i.ytimg.com",
  "font-src 'self' data:",
  // pypi.org + files.pythonhosted.org: micropip installs PyPI wheels
  // directly from the browser. Without these, every micropip install
  // was blocked by the CSP and the Modules panel's Install button
  // silently failed for any package not built into Pyodide.
  // blob: is required too: the PDF viewer fetches the file's bytes
  // with fetch() (pdf.js parses from memory), and a dropped/repo
  // PDF's source is a blob: URL — without blob: here the fetch is
  // CSP-blocked and every PDF fails with "Could not preview this
  // file." (image/video/audio render from blob: URLs through
  // img-src/media-src, which is why only the PDF broke). blob: URLs
  // are same-origin by construction, so this stays narrow.
  "connect-src 'self' blob: https://cdn.jsdelivr.net https://pypi.org https://files.pythonhosted.org",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  // youtube-nocookie embeds the course videos that don't have a
  // MEGA/Drive link yet (temporary fallback — Maalik replaces them
  // with MEGA/Drive links when he has them). No 'self' or blob:
  // here anymore — the PDF viewer used to need blob: (Chrome
  // renders a PDF <embed> inside a nested frame, checked against
  // frame-src), but the viewer is pdf.js now: canvas + text layer,
  // no embed, no frame.
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
  // Back to 'none': the PDF viewer's native <embed> was the only
  // plugin content on the site, and pdf.js replaced it — canvas +
  // text layer needs no plugin permission at all. blob: stays on
  // img-src / media-src (dropped images, video and audio still
  // render from blob: URLs), which are the narrow permissions
  // those viewers need.
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // No framing at all (X-Frame-Options: DENY is kept alongside it
  // for older browsers that only honour the header).
  "frame-ancestors 'none'",
];

function allowDevelopmentRefreshEval(policy: string): string {
  return process.env.NODE_ENV === "development"
    ? policy.replace("script-src ", "script-src 'unsafe-eval' ")
    : policy;
}

const csp = allowDevelopmentRefreshEval(cspDirectives.join("; "));

// Nonce CSP (R2-L17): the same directives, but script-src carries a
// per-request nonce instead of 'unsafe-inline'. style-src keeps
// 'unsafe-inline' — inline style={{...}} attributes cannot carry a
// nonce. Built by middleware.ts for the matched pages; the header
// CSP above stays for every route middleware does not cover.
// Verified against the scratch build: on matched pages the
// middleware response header replaces the config CSP, it does not
// duplicate it — so the nonce policy is the one enforced there.
export function buildCspWithNonce(nonce: string): string {
  const policy = cspDirectives
    .map((d) =>
      d.startsWith("script-src ")
        ? d.replace("'unsafe-inline'", `'nonce-${nonce}'`)
        : d,
    )
    .join("; ");
  return allowDevelopmentRefreshEval(policy);
}

// Meta-CSP fallback (R2-M15): Next ignores headers() for
// `output: "export"`, so the static/desktop build shipped ZERO
// security headers. layout.tsx emits this same policy as a
// <meta http-equiv="Content-Security-Policy"> tag, which the export
// build does honour. `frame-ancestors` cannot be expressed in a meta
// tag (browsers ignore it there) and there is no meta equivalent of
// X-Frame-Options, so the export build still has NO framing
// protection — that gap is honest and stays until the static host
// serves real headers. On the normal web build the meta tag is
// redundant (the header carries the same policy plus
// frame-ancestors) and harmless: multiple CSPs are enforced as
// their intersection.
export const cspMeta = csp
  .split(";")
  .map((d) => d.trim())
  .filter((d) => d !== "" && !d.startsWith("frame-ancestors"))
  .join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=()",
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
  // Desktop (Tauri) builds bundle a static export instead:
  // LP_DESKTOP_EXPORT=1 switches the output to 'export'. The normal
  // Vercel build is untouched (output stays 'standalone').
  output: process.env.LP_DESKTOP_EXPORT === "1" ? "export" : "standalone",
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

