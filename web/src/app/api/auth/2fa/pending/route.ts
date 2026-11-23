import { NextRequest, NextResponse } from "next/server";
import {
  getAuthPrereqs,
  noStore,
  rateLimit,
  readPending2fa,
  serviceUnavailable,
} from "@/lib/auth-routes";

// GET /api/auth/2fa/pending — whether a valid 2FA step-up cookie is
// present (used by the /auth/2fa page to decide what to render).
// The email is never returned here; the cookie holder already knows it.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "auth-2fa-pending", 30, 60_000, {
    failClosed: true,
  });
  if (limited) return noStore(limited);

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return noStore(serviceUnavailable("2fa-pending"));

  const pending = await readPending2fa(req, prereqs.secret);
  return noStore(NextResponse.json({ pending: pending !== null }));
}
