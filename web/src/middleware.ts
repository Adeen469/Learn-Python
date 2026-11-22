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
  ],
};

export function middleware(req: NextRequest) {
  if (!req.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}
