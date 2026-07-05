import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "outline";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-stone-100 text-stone-600",
        variant === "primary" && "bg-teal-50 text-teal-800",
        variant === "success" && "bg-emerald-50 text-emerald-700",
        variant === "warning" && "bg-amber-50 text-amber-800",
        variant === "outline" && "border border-stone-200 bg-white text-stone-600",
        className
      )}
    >
      {children}
    </span>
  );
}
