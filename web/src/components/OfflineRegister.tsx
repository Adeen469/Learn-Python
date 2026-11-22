"use client";

import { useEffect } from "react";
// Tauri desktop check, inlined here so the offline code does not
// depend on the app sign-in lib (web/src/lib/app-auth.ts).
function isTauri(): boolean {
  return (
    typeof window !== "undefined" &&
    "__TAURI_INTERNALS__" in window &&
    (window as unknown as { __TAURI_INTERNALS__?: unknown })
      .__TAURI_INTERNALS__ !== undefined
  );
}

// Registers the offline service worker on the live website only:
// never inside the Tauri desktop app (tauri:// origin, and isTauri()
// is true there) and never on a non-secure origin. Localhost is
// allowed — it is a secure context and the only way to test offline
// locally. Never throws: no SW support, no registration.
export default function OfflineRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isTauri()) return;
    if (!("serviceWorker" in navigator)) return;
    const { protocol, hostname } = window.location;
    if (
      protocol !== "https:" &&
      hostname !== "localhost" &&
      hostname !== "127.0.0.1"
    )
      return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  return null;
}
