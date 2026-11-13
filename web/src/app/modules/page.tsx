"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Packages & Modules is NOT a separate page anymore — it lives inside the
// Code Editor as the "Modules" tab. This route only redirects there.
export default function ModulesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/editor?tab=modules");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <p className="text-sm text-neutral-400">Opening Modules in the Code Editor…</p>
    </div>
  );
}
