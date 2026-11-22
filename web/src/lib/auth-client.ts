// Client-side session access. Talks only to our own /api/auth/* routes —
// it never sees tokens, secrets, or the session cookie (HttpOnly).
// A module-level cached promise dedupes the /api/auth/me call across
// components within one page load.
//
// Tauri desktop: the app holds its session token in localStorage
// (the static export has no cookie to read) and calls the WEBSITE's
// /api/auth/me with it as a Bearer token. The website path below is
// unchanged.

// NOTE (push-83): the Tauri/app-sign-in branch is out of this push
// on purpose - the website-only session path below is unchanged.
// The full version (app-auth import + fetchTauriSessionUser) comes
// back with the sign-in push.

export interface SessionUser {
  email: string;
  name: string;
  picture: string | null;
  /** How this session was created ("google" for old sessions). */
  auth?: "google" | "email";
  /** True only when two-factor authentication was completed. */
  mfa?: boolean;
}

let cachedUserPromise: Promise<SessionUser | null> | null = null;

// No identity is ever cached in localStorage (L16): the old
// lp_last_user fallback let a signed-out / shared device open gated
// pages offline as the previous user, and any XSS could read the
// stored identity. A failed /api/auth/me check now resolves to null
// — offline the app shows the signed-out state, never a stale user.
// The server still enforces auth on every API call, and the
// service worker may serve cached pages offline, but those pages
// render signed-out without a live session check.


export function fetchSessionUser(): Promise<SessionUser | null> {
  if (!cachedUserPromise) {
    cachedUserPromise = fetch("/api/auth/me", { credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) {
          return null;
        }
        const data: unknown = await res.json().catch(() => null);
        if (
          typeof data !== "object" ||
          data === null ||
          !("user" in data) ||
          typeof (data as { user: unknown }).user !== "object" ||
          (data as { user: unknown }).user === null
        ) {
          return null;
        }
        const u = (data as { user: Record<string, unknown> }).user;
        if (typeof u.email !== "string" || typeof u.name !== "string") {
          return null;
        }
        const user = {
          email: u.email,
          name: u.name,
          picture: typeof u.picture === "string" ? u.picture : null,
          auth: (
            u.auth === "email" || u.auth === "google" ? u.auth : "google"
          ) as "google" | "email",
          mfa: u.mfa === true,
        };
        return user;
      })
      .catch(() => null);
  }
  return cachedUserPromise;
}

export function clearSessionCache(): void {
  cachedUserPromise = null;
}

export async function signOut(): Promise<void> {
  // Legacy cleanup: versions before this fix stored the last-known
  // user under lp_last_user — drop any stale copy on sign-out.
  try {
    localStorage.removeItem("lp_last_user");
  } catch {
    // Ignore.
  }
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    // The cookie clear is best-effort; the redirect below lands on the
    // landing page either way, and /api/auth/me will 401 without it.
  } finally {
    clearSessionCache();
  }
}
