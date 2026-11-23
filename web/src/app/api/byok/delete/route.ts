import { NextRequest, NextResponse } from "next/server";
import { getAuthPrereqs, getSessionUser } from "@/lib/auth-routes";
import { checkIpLimit, checkUserLimit } from "@/lib/api-handler";
import { deleteByokKey, isValidByokProvider } from "@/lib/byok-store";

// Delete a saved BYOK provider key (migration 009).
//
// DELETE /api/byok/delete?provider=groq — removes that provider's
// stored key for the signed-in user. Deleting a provider that has
// no stored key is still a success (nothing left to delete).
export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  let ipBlocked;
  try {
    ipBlocked = await checkIpLimit(req, "byok-delete", 10, 60_000, { failClosed: true });
  } catch {
    return NextResponse.json(
      { error: "BYOK is temporarily unavailable." },
      { status: 503 }
    );
  }
  if (ipBlocked) return ipBlocked;
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
  // R2-L14: per-user bucket alongside the per-IP one.
  let userBlocked;
  try {
    userBlocked = await checkUserLimit(user.email, "byok-delete", 10, 60_000, { failClosed: true });
  } catch {
    return NextResponse.json(
      { error: "BYOK is temporarily unavailable." },
      { status: 503 }
    );
  }
  if (userBlocked) return userBlocked;
  const provider = req.nextUrl.searchParams.get("provider");
  if (!isValidByokProvider(provider)) {
    return NextResponse.json({ error: "provider is not valid." }, { status: 400 });
  }
  // R2-L10: check the delete actually landed before claiming
  // success — a user deleting a key after suspecting compromise
  // must not be told it is gone while it is still stored and
  // usable by /api/ai.
  const deleted = await deleteByokKey(user.email, provider);
  if (!deleted) {
    return NextResponse.json(
      { error: "Could not delete the key — please try again." },
      { status: 503 }
    );
  }
  return NextResponse.json({ deleted: true, provider });
}
