"use client";

import { cn } from "@/lib/utils";

export function PillTabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-hide pb-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
            active === tab.id ? "pill-active shadow-lg" : "pill-inactive hover:bg-white/10"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
