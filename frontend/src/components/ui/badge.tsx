import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "primary" | "outline";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variant === "default" && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        variant === "primary" && "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
        variant === "success" && "bg-secondary-100 text-secondary-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        variant === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        variant === "outline" && "border border-border bg-transparent text-muted",
        className
      )}
      {...props}
    />
  );
}
