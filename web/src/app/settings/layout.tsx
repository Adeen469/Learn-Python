// Server-side gate for /settings. The settings page is a client
// component with no auth gate of its own — without this layout a
// guest can open it and only the navbar notices. This runs on the
// server before anything renders: no cookie, an unverifiable
// session, or a failed version check redirects to the landing page.
// Fail closed throughout — a DB blip redirects, it never lets a
// guest through. (Same shape as the getSessionUser check the API
// routes use: signature, then the stored session version.)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionSecret, SESSION_COOKIE, verifySession } from "@/lib/auth";
import { getSessionVersionByEmail } from "@/lib/auth-store";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/");
  const secret = getSessionSecret();
  if (!secret) redirect("/");
  let ok = false;
  try {
    const verified = await verifySession(secret, token);
    if (verified.ok) {
      const check = await getSessionVersionByEmail(verified.user.email);
      ok = check.ok && (check.version === null || check.version === verified.user.sv);
    }
  } catch {
    ok = false;
  }
  if (!ok) redirect("/");
  return <>{children}</>;
}
