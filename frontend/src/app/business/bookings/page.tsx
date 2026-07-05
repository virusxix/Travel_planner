"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CalendarCheck, Mail, Search } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { DashboardShell, DashboardSidebar } from "@/components/layout/dashboard-shell";
import { DataTable } from "@/components/shared/data-table";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/shared/toast-provider";
import { DemoDataBanner } from "@/components/shared/demo-data-banner";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { hostEarnings } from "@/lib/earnings";
import { BUSINESS_NAV } from "@/lib/business-nav";
import {
  DEMO_HOST_BOOKINGS,
  useHostDemo,
} from "@/lib/business-demo";
import type { Booking, Property } from "@/types";

const STATUS_TABS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

function statusVariant(status: string): "success" | "warning" | "primary" | "default" {
  if (status === "CONFIRMED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "COMPLETED") return "primary";
  return "default";
}

export default function BusinessBookingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [tab, setTab] = useState<StatusTab>("ALL");
  const [search, setSearch] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

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

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api(`/bookings/${id}/confirm`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-bookings"] });
      toast({ title: "Booking confirmed", variant: "success" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api(`/bookings/${id}/cancel`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-bookings"] });
      setCancelTarget(null);
      toast({ title: "Booking cancelled", variant: "success" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "error" }),
  });

  function guardDemo() {
    if (!isDemo) return false;
    toast({ title: "Sample data", description: "Connect a real property to manage live bookings.", variant: "info" });
    return true;
  }

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allBookings
      .filter((b) => (tab === "ALL" ? true : b.status === tab))
      .filter((b) => {
        if (!q) return true;
        const guest = `${b.user?.firstName ?? ""} ${b.user?.lastName ?? ""} ${b.user?.email ?? ""}`.toLowerCase();
        const prop = (b.property?.name ?? "").toLowerCase();
        return guest.includes(q) || prop.includes(q);
      })
      .map((b) => ({
        id: b.id,
        status: b.status,
        propertyName: b.property?.name ?? "—",
        guestName: b.user ? `${b.user.firstName} ${b.user.lastName}` : "Guest",
        guestEmail: b.user?.email ?? "",
        guestPhone: b.user?.phone ?? "",
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        nights: b.nights,
        guests: b.guests,
        guestPaid: Number(b.finalTotal) || 0,
        earnings: hostEarnings(b.finalTotal),
        raw: b,
      }));
  }, [allBookings, tab, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: allBookings.length };
    for (const b of allBookings) c[b.status] = (c[b.status] ?? 0) + 1;
    return c;
  }, [allBookings]);

  if (!user || user.role !== "BUSINESS_OWNER") return null;

  return (
    <DashboardShell
      sidebar={<DashboardSidebar items={BUSINESS_NAV} title="Business Owner" />}
      heading="Reservations"
      subheading="Manage guest bookings and earnings"
    >
      {isDemo && <DemoDataBanner />}

      {allBookings.length === 0 ? (
        <GlassCard hover={false} className="p-12 text-center">
          <CalendarCheck className="h-12 w-12 mx-auto text-teal-300" />
          <p className="mt-4 font-display font-semibold">No reservations yet</p>
          <p className="text-sm text-muted mt-2">
            Once travelers book your live listings, their reservations show up here.
          </p>
        </GlassCard>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {STATUS_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors",
                  tab === t
                    ? "bg-teal-500 text-white border-teal-500"
                    : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                )}
              >
                {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
                <span className="ml-1.5 opacity-70">{counts[t] ?? 0}</span>
              </button>
            ))}
            <div className="relative ml-auto">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guest or property"
                className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
          </div>

          <DataTable
            keyField="id"
            data={rows}
            emptyMessage="No bookings match your filters."
            columns={[
              { key: "propertyName", header: "Property", render: (r) => <span className="font-medium">{r.propertyName}</span> },
              {
                key: "guestName",
                header: "Guest",
                render: (r) => (
                  <div className="min-w-[10rem]">
                    <p className="font-medium">{r.guestName}</p>
                    {r.guestEmail && <p className="text-xs text-muted">{r.guestEmail}</p>}
                    {r.guestPhone && <p className="text-xs text-muted">{r.guestPhone}</p>}
                    {r.guestEmail && (
                      <a
                        href={`mailto:${r.guestEmail}?subject=${encodeURIComponent(`Your stay at ${r.propertyName}`)}`}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-teal-300 hover:text-teal-200"
                      >
                        <Mail className="h-3 w-3" /> Message guest
                      </a>
                    )}
                  </div>
                ),
              },
              {
                key: "checkIn",
                header: "Dates",
                render: (r) => (
                  <div className="whitespace-nowrap">
                    <p>{formatDate(r.checkIn)} → {formatDate(r.checkOut)}</p>
                    <p className="text-xs text-muted">{r.nights} {r.nights === 1 ? "night" : "nights"}</p>
                  </div>
                ),
              },
              { key: "guests", header: "Guests", render: (r) => <span>{r.guests}</span> },
              {
                key: "status",
                header: "Status",
                render: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge>,
              },
              {
                key: "guestPaid",
                header: "Guest paid",
                render: (r) => <span className="whitespace-nowrap">{formatCurrency(r.guestPaid)}</span>,
              },
              {
                key: "earnings",
                header: "You earn",
                render: (r) => (
                  <div className="whitespace-nowrap">
                    <p className="font-semibold text-emerald-400">{formatCurrency(r.earnings)}</p>
                    <p className="text-xs text-muted">after 5% fee</p>
                  </div>
                ),
              },
              {
                key: "actions",
                header: "",
                render: (r) => (
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    {r.status === "PENDING" && (
                      <Button
                        size="sm"
                        className="rounded-lg"
                        disabled={confirmMutation.isPending}
                        onClick={() => { if (!guardDemo()) confirmMutation.mutate(r.id); }}
                      >
                        Confirm
                      </Button>
                    )}
                    {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg text-red-400"
                        onClick={() => { if (!guardDemo()) setCancelTarget(r.raw); }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </>
      )}

      <Modal
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel this booking?"
        description="The guest will be notified and the reservation released. This cannot be undone."
      >
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => setCancelTarget(null)}>
            Keep booking
          </Button>
          <Button
            className="flex-1 rounded-xl bg-red-600 hover:bg-red-700"
            disabled={cancelMutation.isPending}
            onClick={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
          >
            Cancel booking
          </Button>
        </div>
      </Modal>
    </DashboardShell>
  );
}
