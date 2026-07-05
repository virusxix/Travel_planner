"use client";

import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl y-card",
        hover && "transition-shadow hover:shadow-[var(--shadow-y-float)]",
        className
      )}
    >
      {children}
    </div>
  );
}
