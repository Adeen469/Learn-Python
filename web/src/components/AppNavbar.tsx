"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Code2, Flame, Github, Package, Target } from "lucide-react";
import { useEffect, useState } from "react";

export function AppNavbar() {
  const pathname = usePathname();
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(30);
  const [minutesSpent, setMinutesSpent] = useState(0);

  useEffect(() => {
    const savedMins = localStorage.getItem("lp_minutes_today");
    if (savedMins) setMinutesSpent(Number(savedMins));
  }, []);

  const navLinks = [
    { href: "/", label: "Courses", icon: BookOpen },
    { href: "/editor", label: "Code Editor", icon: Code2 },
    { href: "/modules", label: "Packages & Modules", icon: Package },
    { href: "/github", label: "GitHub", icon: Github },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800 bg-black/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 hover:opacity-90 transition">
            <img
              src="/lp-logo.png"
              alt="LP Logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-contain"
            />
            <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-white">
              LP <span className="hidden text-xs text-neutral-500 font-normal lg:inline">Learn Python</span>
            </span>
          </Link>

          <nav className="flex min-w-0 items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  aria-label={label}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 ${
                    active
                      ? "bg-white text-black"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <div className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-neutral-300">
            <Target className="h-3.5 w-3.5 text-neutral-400" />
            <span>{minutesSpent}/{dailyGoalMinutes}m</span>
          </div>
          <div className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-white md:flex">
            <Flame className="h-3.5 w-3.5 text-white" />
            <span>1d streak</span>
          </div>
        </div>
      </div>
    </header>
  );
}

