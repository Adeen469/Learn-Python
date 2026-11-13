// Client-side session access. Talks only to our own /api/auth/* routes —
// it never sees tokens, secrets, or the session cookie (HttpOnly).
// A module-level cached promise dedupes the /api/auth/me call across
// components within one page load.

export interface SessionUser {
  email: string;
  name: string;
  picture: string | null;
}

let cachedUserPromise: Promise<SessionUser | null> | null = null;

export function fetchSessionUser(): Promise<SessionUser | null> {
  if (!cachedUserPromise) {
    cachedUserPromise = fetch("/api/auth/me", { credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) return null;
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
        return {
          email: u.email,
          name: u.name,
          picture: typeof u.picture === "string" ? u.picture : null,
        };
      })
      .catch(() => null);
  }
  return cachedUserPromise;
}

export function clearSessionCache(): void {
  cachedUserPromise = null;
}

export async function signOut(): Promise<void> {
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
