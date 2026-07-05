"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Wallet, Clock, TrendingUp, CalendarClock, Info } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { DashboardShell, DashboardSidebar } from "@/components/layout/dashboard-shell";
import { StatWidget } from "@/components/shared/stat-widget";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { DemoDataBanner } from "@/components/shared/demo-data-banner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { COMMISSION_RATE, hostEarnings, platformFee, summarizeEarnings } from "@/lib/earnings";
import { BUSINESS_NAV } from "@/lib/business-nav";
import { DEMO_HOST_BOOKINGS, useHostDemo } from "@/lib/business-demo";
import type { Booking, Property } from "@/types";

function statusVariant(status: string): "success" | "warning" | "primary" | "default" {
  if (status === "CONFIRMED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "COMPLETED") return "primary";
  return "default";
}

export default function BusinessPayoutsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role !== "BUSINESS_OWNER") router.replace("/dashboard");
  }, [user, router]);

  const { data: properties, isFetched, isError } = useQuery({
    queryKey: ["owner-properties"],
    queryFn: () => api<Property[]>("/properties/owner/me"),
    enabled: user?.role === "BUSINESS_OWNER",
  });

  const { data: bookings } = useQuery({
    queryKey: ["owner-bookings"],
    queryFn: () => api<Booking[]>("/bookings/owner"),
    enabled: user?.role === "BUSINESS_OWNER",
  });

  const isDemo = useHostDemo(properties, { isFetched, isError });
  const allBookings = isDemo ? DEMO_HOST_BOOKINGS : (bookings ?? []);

  const summary = useMemo(() => summarizeEarnings(allBookings), [allBookings]);

  const transactions = useMemo(
    () =>
      [...allBookings]
        .filter((b) => b.status !== "PENDING")
        .sort((a, b) => (a.checkOut < b.checkOut ? 1 : -1)),
    [allBookings]
  );

  if (!user || user.role !== "BUSINESS_OWNER") return null;

  return (
    <DashboardShell
      sidebar={<DashboardSidebar items={BUSINESS_NAV} title="Business Owner" />}
      heading="Earnings"
      subheading={`Your payouts after a flat ${Math.round(COMMISSION_RATE * 100)}% platform fee`}
    >
      {isDemo && <DemoDataBanner />}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatWidget label="Available balance" value={formatCurrency(summary.available)} icon={Wallet} trend="up" change="Ready to pay out" />
        <StatWidget label="Pending clearance" value={formatCurrency(summary.pending)} icon={Clock} trend="neutral" change="Clears after checkout" />
        <StatWidget label="Lifetime earnings" value={formatCurrency(summary.lifetime)} icon={TrendingUp} trend="up" />
        <StatWidget label="Next payout" value="Tuesday" icon={CalendarClock} trend="neutral" change="Payouts weekly, Tuesdays" />
      </div>

      <GlassCard hover={false} className="mb-8 flex items-start gap-3 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
        <p className="text-sm text-muted">
          Bank transfer &amp; Stripe Connect payout setup is coming soon. For now, balances accrue
          automatically as bookings complete. You keep {Math.round((1 - COMMISSION_RATE) * 100)}% of every stay.
        </p>
      </GlassCard>

      <h2 className="font-display text-xl font-bold mb-4">Transactions</h2>
      {transactions.length === 0 ? (
        <GlassCard hover={false} className="p-12 text-center">
          <Wallet className="h-12 w-12 mx-auto text-teal-300" />
          <p className="mt-4 font-display font-semibold">No earnings yet</p>
          <p className="text-sm text-muted mt-2">Confirmed and completed bookings will appear here with their fee breakdown.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {transactions.map((b) => (
            <GlassCard key={b.id} hover={false} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display font-semibold">{b.property?.name ?? "Stay"}</p>
                  <p className="text-sm text-muted">
                    {b.user ? `${b.user.firstName} ${b.user.lastName} · ` : ""}
                    {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                  </p>
                </div>
                <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted">Guest paid</p>
                  <p className="font-semibold">{formatCurrency(Number(b.finalTotal) || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Platform fee ({Math.round(COMMISSION_RATE * 100)}%)</p>
                  <p className="font-semibold text-red-400">−{formatCurrency(platformFee(b.finalTotal))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">You earn</p>
                  <p className="font-semibold text-emerald-400">{formatCurrency(hostEarnings(b.finalTotal))}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
