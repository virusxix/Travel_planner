"use client";

import { User, Building2, Shield } from "lucide-react";
import { DEMO_ACCOUNTS } from "@/lib/auth-examples";
import { cn } from "@/lib/utils";

const ICONS = {
  TRAVELER: User,
  BUSINESS_OWNER: Building2,
  ADMIN: Shield,
} as const;

export function DemoAccounts({
  onSelect,
  compact = false,
  hint = "One click fills the form — no signup needed for testing.",
}: {
  onSelect: (email: string, password: string) => void;
  compact?: boolean;
  hint?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-slate-50 p-4", compact && "p-3")}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Try a demo account</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
      <div className={cn("mt-3 space-y-2", compact && "mt-2")}>
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = ICONS[account.role];
          return (
            <button
              key={account.email}
              type="button"
              onClick={() => onSelect(account.email, account.password)}
              className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition-colors hover:border-brand-500/40 hover:bg-brand-500/5"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{account.label}</span>
                  <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium text-brand-600">
                    Demo
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">{account.email}</span>
                {!compact && (
                  <span className="mt-1 block text-xs text-slate-500">{account.description}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
