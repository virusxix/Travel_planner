import Link from "next/link";
import { Building2, BedDouble, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Create listing", detail: "Name, location, photos", icon: Building2 },
  { n: 2, label: "Add rooms", detail: "Types, prices, capacity", icon: BedDouble },
  { n: 3, label: "Submit for review", detail: "Admin approves before going live", icon: Send },
] as const;

export function HostListingGuide({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-brand-500/20 bg-brand-500/5 p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display font-semibold text-stone-900">List your property</p>
          <p className="mt-1 text-sm text-stone-500">
            Three steps from draft to live on HiddenStay.
          </p>
        </div>
        <Link href="/business/properties/new">
          <Button className="rounded-xl shrink-0">Start a listing</Button>
        </Link>
      </div>
      <ol className={cn("mt-4 grid gap-3", compact ? "sm:grid-cols-3" : "sm:grid-cols-3")}>
        {STEPS.map((step) => (
          <li key={step.n} className="flex gap-3 rounded-xl bg-white/80 border border-stone-200/80 px-3 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-700">
              {step.n}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-900 flex items-center gap-1.5">
                <step.icon className="h-3.5 w-3.5 text-brand-600" />
                {step.label}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
