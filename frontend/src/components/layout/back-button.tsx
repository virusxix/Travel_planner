"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { getBackFallback } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  fallbackHref?: string;
  label?: string;
  className?: string;
  variant?: "button" | "link";
};

export function BackButton({
  fallbackHref,
  label = "Back",
  className,
  variant = "button",
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const goBack = () => {
    const search =
      typeof window !== "undefined" ? window.location.search.slice(1) : "";
    const fallback = fallbackHref ?? getBackFallback(pathname, search);
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallback);
  };

  const baseClass =
    variant === "link"
      ? "inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
      : "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 bg-white transition-colors";

  return (
    <button type="button" onClick={goBack} className={cn(baseClass, className)}>
      <ArrowLeft className="h-4 w-4 shrink-0" />
      {label ? <span>{label}</span> : <span className="sr-only">Back</span>}
    </button>
  );
}

export function HomeButton({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 bg-white transition-colors",
        className
      )}
    >
      <Home className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">Home</span>
    </Link>
  );
}
