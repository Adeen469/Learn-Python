"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

// Packages & Modules is NOT a separate page anymore — it lives inside the
// Code Editor as the "Modules" tab. This route only redirects there.
export default function ModulesRedirect() {
  const router = useRouter();
  const { t } = useLanguage();
  useEffect(() => {
    router.replace("/editor?tab=modules");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <p className="text-sm text-neutral-400">{t.modulesPage.openingInEditor}</p>
    </div>
  );
}
