import { NextRequest, NextResponse } from "next/server";
import { getAuthPrereqs, getSessionUser } from "@/lib/auth-routes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { deleteByokKey, isValidByokProvider } from "@/lib/byok-store";

// Delete a saved BYOK provider key (migration 009).
//
// DELETE /api/byok/delete?provider=groq — removes that provider's
// stored key for the signed-in user. Deleting a provider that has
// no stored key is still a success (nothing left to delete).
export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  const limit = await checkRateLimit(`byok:${getClientIp(req)}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }
  const prereqs = getAuthPrereqs(req);
  if (!prereqs) {
    return NextResponse.json(
      {
        error:
          "BYOK storage is not set up yet — the server needs its Supabase service key and migration 009.",
      },
      { status: 503 }
    );
  }
  const user = await getSessionUser(req, prereqs.secret);
  if (!user) {
    return NextResponse.json({ error: "Sign in to delete a key" }, { status: 401 });
  }
  const provider = req.nextUrl.searchParams.get("provider");
  if (!isValidByokProvider(provider)) {
    return NextResponse.json({ error: "provider is not valid." }, { status: 400 });
  }
  await deleteByokKey(user.email, provider);
  return NextResponse.json({ deleted: true, provider });
}
