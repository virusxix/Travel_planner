import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export function StatWidget({
  label,
  value,
  change,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  change?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-card p-6 transition-all hover:scale-[1.01]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trend === "up" && "text-secondary-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-muted"
              )}
            >
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
