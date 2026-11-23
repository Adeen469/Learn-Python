// Server-side route protection (defense in depth). The pages under
// these paths also check the session themselves (layouts/pages),
// but a guest must never even reach them: without the session
// cookie, redirect to the landing page. This is a PRESENCE check
// only — the cookie is HMAC-signed, and only the layouts and API
// routes verify the signature (middleware runs on the Edge runtime,
// where the Supabase client cannot run).
//
// SESSION_COOKIE comes from src/lib/auth.ts (the one source of
// truth); auth.ts has no imports and uses WebCrypto only, so it is
// safe to import into the Edge bundle.
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { buildCspWithNonce } from "../next.config";

// Pages a guest must never reach. The `:path*` patterns are the
// matcher entries the middleware used to carry; the redirect below
// checks them as prefixes (pathname === base, or under base/).
const PROTECTED_PATHS = [
  "/settings/:path*",
  "/editor/:path*",
  "/github/:path*",
  "/courses/:path*",
  "/learn/:path*",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((pattern) => {
    const base = pattern.replace(/\/:path\*$/, "");
    return pathname === base || pathname.startsWith(`${base}/`);
  });
}

export const config = {
  matcher: [
    "/api/:path*",
    // Every other document route (R3-L16): the nonce CSP below is
    // minted on ALL pages now — landing, /auth/*, /offline,
    // /logic-builder, /modules — not just the protected ones, so
    // the auth pages (where credentials are typed) no longer run
    // under 'unsafe-inline'. Static files, /_next/* and API routes
    // are excluded: they are not documents and need no nonce.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};

// State-changing methods: only these get the Origin check below.
// GET/HEAD/OPTIONS are safe methods and always pass through.
const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * CSRF defence-in-depth (M8) for /api/*: a state-changing request
 * must come from this site. A same-origin browser fetch sends
 * `Origin: <this site's origin>`; a cross-site form/fetch sends the
 * attacker's origin, which never matches the request's own Host.
 * Non-browser clients send no Origin header and are allowed through
 * (they authenticate with the session cookie or a Bearer token, not
 * ambient browser auth). An unparseable Origin is rejected.
 *
 * This is a same-origin check, not an allowlist of fixed hosts, so
 * it works on every deployment (production, previews, localhost)
 * without config. It does NOT bind the app-exchange GET flow to the
 * initiating browser — that needs a per-browser HttpOnly cookie set
 * where the flow starts and verified by the exchange route, which
 * is a separate change (see the vuln report residual).
 */
function isAllowedApiOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const host = req.headers.get("host");
  return !!host && originHost === host;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // API routes never redirect: they get the Origin check for
  // state-changing methods and pass everything else through (the
  // routes themselves return 401 for missing/invalid sessions).
  if (pathname.startsWith("/api/")) {
    if (
      STATE_CHANGING_METHODS.has(req.method) &&
      !isAllowedApiOrigin(req)
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    return NextResponse.next();
  }
  // Guests are redirected ONLY from the protected paths — the
  // landing page, /auth/* and the other public pages are reachable
  // without a session (they just get the nonce CSP below).
  if (isProtectedPath(pathname) && !req.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  // CSP nonce (R2-L17, extended to all documents in R3-L16): one
  // random nonce per document request. Next reads the nonce from
  // the CSP *request* header and puts it on its own inline scripts
  // (RSC streaming payloads); layout.tsx reads `x-nonce` for the
  // theme script; the *response* header makes the browser enforce
  // it. Verified against the scratch build: the response carries
  // exactly this header — it replaces the config CSP (with
  // 'unsafe-inline') for these routes, it does not duplicate it.
  // API routes are untouched (no documents). 'unsafe-inline' now
  // lives only in the static-export meta fallback (layout.tsx).
  const nonce = crypto.randomUUID();
  const nonceCsp = buildCspWithNonce(nonce);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", nonceCsp);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", nonceCsp);
  return res;
}
