"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

// Slim offline banner, on every page. Shows only while the device
// is offline and clears itself when back online — not dismissible.
// It tells users the one thing they need to know offline: a normal
// refresh (Ctrl+R) reopens saved lessons, a hard refresh
// (Ctrl+Shift+R) skips the saved copy and the browser errors.
export default function OfflineBanner() {
  const { t } = useLanguage();
  const [offline, setOffline] = useState(false);

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

  if (!offline) return null;

  return (
    <div
      role="status"
      className="border-b border-neutral-800 bg-neutral-950 px-4 py-2 text-center text-xs text-neutral-300"
    >
      {t.offline.offlineBanner}
    </div>
  );
}
