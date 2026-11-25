import { NextRequest, NextResponse } from "next/server";
import { getAuthPrereqs, getSessionUser } from "@/lib/auth-routes";
import { checkIpLimit, checkUserLimit } from "@/lib/api-handler";
import { listByokKeys } from "@/lib/byok-store";

// List the signed-in user's saved BYOK providers (migration 009).
//
// GET returns { keys: [{ provider, baseUrl, model, keyHint }] } —
// metadata only. Keys are NEVER returned to the browser, not even
// here; keyHint is only the last 4 chars (migration 013), shown as
// ••••1234, and null before 013 runs. When BYOK storage is not set
// up yet the list is empty (fail closed as "no keys"), not an
// error — the editor just shows no saved providers.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ipBlocked = await checkIpLimit(req, "byok-list", 10, 60_000);
  if (ipBlocked) return ipBlocked;
  const prereqs = getAuthPrereqs(req);
  if (!prereqs) {
    return NextResponse.json({ keys: [] });
  }
  const user = await getSessionUser(req, prereqs.secret);
  if (!user) {
    return NextResponse.json({ error: "Sign in to list saved keys" }, { status: 401 });
  }
  // R2-L14: per-user bucket alongside the per-IP one.
  const userBlocked = await checkUserLimit(user.email, "byok-list", 10, 60_000);
  if (userBlocked) return userBlocked;
  const keys = await listByokKeys(user.email);
  return NextResponse.json({ keys });
}
