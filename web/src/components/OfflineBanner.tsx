"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";

// Slim offline banner, on every page. Shows only while the device
// is offline and clears itself when back online — not dismissible.
// It tells users the one thing they need to know offline: a normal
// refresh (Ctrl+R) reopens saved lessons, a hard refresh
// (Ctrl+Shift+R) skips the saved copy and the browser errors.
// It is sticky at the top so it stays visible while scrolling, and
// it publishes its own height as --offline-banner-h so the sticky
// navbar and sidebar below it stick underneath instead of sliding
// under it (the height changes when the text wraps).
export default function OfflineBanner() {
  const { t } = useLanguage();
  const [offline, setOffline] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (!offline) return;
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const apply = () =>
      root.style.setProperty("--offline-banner-h", `${el.offsetHeight}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--offline-banner-h");
    };
  }, [offline, t.offline.offlineBanner]);

  if (!offline) return null;

  return (
    <div
      ref={ref}
      role="status"
      className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950 px-4 py-2 text-center text-xs text-neutral-300"
    >
      {t.offline.offlineBanner}
    </div>
  );
}
