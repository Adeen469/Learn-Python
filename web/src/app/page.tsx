"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/SplashScreen";
import { LandingPage } from "@/components/LandingPage";
import { fetchSessionUser, type SessionUser } from "@/lib/auth-client";

/**
 * Home: guests see ONLY the landing page. Signed-in users go straight
 * to Learn — the W3Schools-style topic main page. There is no
 * 100-days course page any more.
 */
export default function HomePage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ checked: boolean; user: SessionUser | null }>({
    checked: false,
    user: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetchSessionUser().then((user) => {
      if (cancelled) return;
      setAuth({ checked: true, user });
      if (user) router.replace("/learn/python-home");
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!auth.checked) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <SplashScreen />
      </div>
    );
  }

  if (!auth.user) {
    return <LandingPage />;
  }

  // Signed-in: brief splash while the redirect lands.
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <SplashScreen />
    </div>
  );
}
