"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PanelLeft } from "lucide-react";
import { fetchSessionUser } from "@/lib/auth-client";
import { AppNavbar } from "@/components/AppNavbar";
import { LearnSidebar } from "@/components/LearnSidebar";

/**
 * Learn layout: the top navbar (Learn / Video Courses / Code Editor)
 * plus the topic sidebar on the left. Same auth gate as the editor —
 * guests go back to the landing page.
 */
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeSlug = pathname.split("/learn/")[1]?.split("/")[0] ?? "python-home";

  useEffect(() => {
    let cancelled = false;
    fetchSessionUser().then((user) => {
      if (cancelled) return;
      if (!user) {
        router.replace("/");
        return;
      }
      setChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Close the mobile drawer when the topic changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pb-20 md:pb-0">
      <AppNavbar />
      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <LearnSidebar
          activeSlug={activeSlug}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-600 hover:text-white md:hidden"
          >
            <PanelLeft className="h-4 w-4" /> Topics
          </button>
          {children}
        </main>
      </div>
    </div>
  );
}
