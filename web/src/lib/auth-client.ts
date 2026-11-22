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

// Last-known signed-in user, kept only so the app still opens its
// gated pages when the device is offline: the live /api/auth/me check
// cannot run without a network, and the lesson content ships in the
// client bundle anyway, so this gates nothing the server protects —
// every API call still needs the real session cookie. Stored on a
// successful check, cleared on a 401 or an explicit sign-out.
const LAST_USER_KEY = "lp_last_user";

function readLastUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(LAST_USER_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as Record<string, unknown>;
    if (typeof u.email !== "string" || typeof u.name !== "string")
      return null;
    return {
      email: u.email,
      name: u.name,
      picture: typeof u.picture === "string" ? u.picture : null,
      auth: (u.auth === "email" || u.auth === "google"
        ? u.auth
        : "google") as "google" | "email",
      mfa: u.mfa === true,
    };
  } catch {
    return null;
  }
}

function storeLastUser(user: SessionUser): void {
  try {
    localStorage.setItem(LAST_USER_KEY, JSON.stringify(user));
  } catch {
    // Private mode etc. — offline fallback just won't exist.
  }
}

function clearLastUser(): void {
  try {
    localStorage.removeItem(LAST_USER_KEY);
  } catch {
    // Ignore.
  }
}


export function fetchSessionUser(): Promise<SessionUser | null> {
  if (!cachedUserPromise) {
    cachedUserPromise = fetch("/api/auth/me", { credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) clearLastUser();
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
        storeLastUser(user);
        return user;
      })
      .catch(() => readLastUser());
  }
  return cachedUserPromise;
}

export function clearSessionCache(): void {
  cachedUserPromise = null;
}

export async function signOut(): Promise<void> {
  clearLastUser();
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
