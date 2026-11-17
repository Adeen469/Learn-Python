import { NextRequest, NextResponse } from "next/server";
import {
  getAuthPrereqs,
  rateLimit,
  readPending2fa,
  serviceUnavailable,
} from "@/lib/auth-routes";

// GET /api/auth/2fa/pending — whether a valid 2FA step-up cookie is
// present (used by the /auth/2fa page to decide what to render).
// The email is never returned here; the cookie holder already knows it.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, "auth-2fa-pending", 30, 60_000);
  if (limited) return limited;

  const prereqs = getAuthPrereqs(req);
  if (!prereqs) return serviceUnavailable("2fa-pending");

  const email = await readPending2fa(req, prereqs.secret);
  return NextResponse.json({ pending: email !== null });
}
