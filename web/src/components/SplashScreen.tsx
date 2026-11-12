"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible");

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fading"), 1500);
    const removeTimer = setTimeout(() => setPhase("gone"), 2050);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-all duration-500 ease-out ${
        phase === "fading"
          ? "pointer-events-none opacity-0 scale-105"
          : "opacity-100 scale-100"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Subtle monochrome ambient glow */}
        <div className="animate-splash-glow pointer-events-none absolute -inset-8 rounded-full bg-white/20 blur-3xl" />

        {/* Logo */}
        <div className="animate-splash-logo relative overflow-hidden rounded-3xl shadow-2xl">
          <img
            src="/lp-logo.png"
            alt="LP Logo"
            width={112}
            height={112}
            className="h-28 w-28 object-contain"
          />
        </div>

        {/* Title & Subtitle */}
        <div className="animate-splash-text mt-6 flex flex-col items-center text-center">
          <span className="text-lg font-semibold tracking-[0.22em] text-white">
            LP
          </span>
          <span className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-500">
            Learn • Practice • Offline
          </span>

          {/* Smooth monochrome loading sweep */}
          <div className="mt-5 h-[2px] w-32 overflow-hidden rounded-full bg-neutral-800">
            <div className="animate-splash-bar h-full w-1/2 rounded-full bg-gradient-to-r from-neutral-600 via-white to-neutral-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

