// Middleware: nonce CSP on every document route + CSRF Origin check
// on state-changing /api/* calls. It NO LONGER bounces guests off
// any page: /learn, /logic-builder and /settings are public, and the
// gated pages (/courses, /editor, /github) render their own sign-in
// gate screen (warning + Sign in button) instead of a silent bounce
// to the landing page — a guest must SEE the gate, and the middleware
// redirect would hide it. The pages fetch no user data before their
// gate resolves, and every /api/* route still 401s for guests, so
// nothing leaks by letting a guest reach the page shell.
//
// SESSION_COOKIE is not read here any more (the pages check the
// session themselves via /api/auth/me); auth.ts stays the source of
// truth for the cookie name on the API side.
import { NextRequest, NextResponse } from "next/server";
import { buildCspWithNonce } from "../next.config";

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
  // No guest redirect here: every document route is reachable, and
  // the gated pages render their own sign-in gate (see the header
  // comment). The landing page, /auth/* and the other public pages
  // just get the nonce CSP below.
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
