"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Search, Heart, User, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { isNightRoute } from "@/lib/theme-routes";

const items = [
  { href: "/hidden-gems", label: "Explore", icon: Search },
  { href: "/planner", label: "Planner", icon: Compass },
  { href: "/dashboard", label: "Trips", icon: Map },
  { href: "/dashboard#saved", label: "Saved", icon: Heart },
  { href: "/login", label: "Account", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const dark = isNightRoute(pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-pb px-3 pb-3">
      <div
        className={cn(
          "rounded-2xl border px-2 py-2 backdrop-blur-xl",
          dark ? "border-white/10 bg-[#0a1622]/60" : "border-stone-200 bg-white/70"
        )}
      >
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/hidden-gems" && pathname.startsWith("/hidden-gems")) ||
              (item.href === "/planner" && pathname.startsWith("/planner")) ||
              (item.href === "/dashboard" && pathname.startsWith("/dashboard"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]",
                  dark
                    ? active
                      ? "text-white"
                      : "text-white/45"
                    : active
                      ? "text-stone-900"
                      : "text-stone-400"
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
