// Resolves the editor's per-user storage scope from the signed-in
// session. The editor page already fetches the session for its auth
// gate, and fetchSessionUser caches that one call — so resolving the
// scope here adds no extra request. Restore effects in the editor
// hooks await this before reading any scoped state; until it
// resolves, scoped reads fall back to the "guest" scope (empty).
// Signed-out resolves to "guest" — the editor redirects guests, so
// that only matters for pre-gate renders and tests. A session change
// without a reload cannot happen inside the editor (sign-out
// redirects to /), so the scope is resolved once per page load.
import { fetchSessionUser } from "@/lib/auth-client";
import { setEditorStorageScope } from "./editor-utils";

let scopePromise: Promise<string> | null = null;

export function ensureEditorScope(): Promise<string> {
  if (!scopePromise) {
    scopePromise = fetchSessionUser()
      .then((user) => {
        const scope = user?.email ? user.email.toLowerCase() : "guest";
        setEditorStorageScope(scope);
        return scope;
      })
      .catch(() => {
        setEditorStorageScope("guest");
        return "guest";
      });
  }
  return scopePromise;
}
