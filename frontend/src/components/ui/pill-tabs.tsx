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
    <div className={cn("flex gap-1 overflow-x-auto scrollbar-hide pb-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            active === tab.id ? "pill-active" : "pill-inactive"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
