"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Compass, Heart, MessageCircle, Map, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlannerNavId = "chat" | "trips" | "explore" | "saved" | "profile";

const items: { id: PlannerNavId; label: string; icon: typeof Map; getHref: (id: string | null) => string }[] = [
  {
    id: "chat",
    label: "AI Chat",
    icon: MessageCircle,
    getHref: (itineraryId) =>
      itineraryId ? `/planner?view=chat&id=${itineraryId}` : "/planner?view=chat",
  },
  {
    id: "trips",
    label: "Trips",
    icon: Map,
    getHref: (itineraryId) => (itineraryId ? `/planner?id=${itineraryId}` : "/planner"),
  },
  { id: "explore", label: "Explore", icon: Compass, getHref: () => "/hidden-gems" },
  { id: "saved", label: "Saved", icon: Heart, getHref: () => "/hidden-gems" },
  { id: "profile", label: "Profile", icon: User, getHref: () => "/dashboard" },
];

export function PlannerBottomNav({
  active,
  itineraryId,
}: {
  active?: PlannerNavId;
  itineraryId?: string | null;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const view = params.get("view");
  const resolvedActive: PlannerNavId =
    active ??
    (pathname === "/planner" && view === "chat" ? "chat" : pathname === "/planner" ? "trips" : "explore");

  return (
    <nav className="shrink-0 z-50 safe-area-pb px-3 pb-3 pt-2">
      <div className="flex items-center justify-center gap-10 sm:gap-16 h-14 rounded-2xl border border-white/10 bg-[#0a1622]/60 backdrop-blur-xl px-2">
        {items.map((item) => {
          const isActive = resolvedActive === item.id;
          const href = item.getHref(itineraryId ?? null);
          return (
            <Link
              key={item.id}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[56px] py-1 transition-colors",
                isActive ? "text-teal-300" : "text-white/55 hover:text-white"
              )}
            >
              <span className="relative">
                <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-teal-400" />
                )}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
