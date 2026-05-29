"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Map, Search, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/planner", label: "AI Chat", icon: Sparkles },
  { href: "/dashboard", label: "Trips", icon: Map },
  { href: "/search", label: "Explore", icon: Search },
  { href: "/dashboard#saved", label: "Saved", icon: Heart },
  { href: "/login", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-3 mb-3 rounded-[1.75rem] bg-white border border-slate-200 px-2 py-2 shadow-[0_-4px_24px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/search" && pathname.startsWith("/search")) ||
              (item.href === "/planner" && pathname.startsWith("/planner")) ||
              (item.href === "/dashboard" && pathname.startsWith("/dashboard"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all min-w-[56px]",
                  active ? "text-brand-500" : "text-muted"
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-500" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
