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
import { maybeWarmAppPages, maybeWarmLessonsAuto } from "@/lib/offline-downloads";

// Starts the lesson-warming job after sign-in (see
// lib/offline-downloads.ts for the gates: Wi-Fi-only toggle,
// connection heuristic, signed-in user) — but ONLY once the user
// has said Yes to the first-sign-in download question. Until then
// the popup asks first; a No means no background job at all.
// The app pages (Settings + Courses tree) warm alongside, without
// the Yes gate — Maalik ordered those cached outright. Retries on
// "online", connection changes, and focus — cheap no-ops once
// everything is cached. Never in the Tauri desktop app, same as
// OfflineRegister.
export default function OfflineWarmer() {
  useEffect(() => {
    if (typeof window === "undefined" || isTauri()) return;
    if (!("caches" in window) || !("serviceWorker" in navigator)) return;
    const kick = () => {
      void maybeWarmLessonsAuto();
      void maybeWarmAppPages();
    };
    kick();
    window.addEventListener("online", kick);
    window.addEventListener("focus", kick);
    const conn = (
      navigator as Navigator & {
        connection?: EventTarget | null;
      }
    ).connection;
    conn?.addEventListener?.("change", kick);
    return () => {
      window.removeEventListener("online", kick);
      window.removeEventListener("focus", kick);
      conn?.removeEventListener?.("change", kick);
    };
  }, []);
  return null;
}
