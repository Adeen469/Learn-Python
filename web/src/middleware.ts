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

export const config = {
  matcher: [
    "/settings/:path*",
    "/editor/:path*",
    "/github/:path*",
    "/courses/:path*",
    "/learn/:path*",
    "/api/:path*",
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
  if (!req.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}
