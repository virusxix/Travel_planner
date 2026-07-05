"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarCheck,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { DashboardShell, DashboardSidebar } from "@/components/layout/dashboard-shell";
import { StatWidget } from "@/components/shared/stat-widget";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Property, Booking } from "@/types";
import {
  DEMO_HOST_ANALYTICS,
  DEMO_HOST_BOOKINGS,
  DEMO_HOST_PROPERTIES,
  useHostDemo,
} from "@/lib/business-demo";
import { DemoDataBanner } from "@/components/shared/demo-data-banner";
import { HostListingGuide } from "@/components/business/host-listing-guide";
import { useToast } from "@/components/shared/toast-provider";

interface OwnerAnalytics {
  revenue: number;
  totalBookings: number;
  occupancyRate: number;
  pendingBookings: number;
  bookingTrends: { month: string; count: number }[];
  popularRoomTypes: { type: string; count: number }[];
}

const nav = [
  { href: "/business", label: "Overview", icon: LayoutDashboard },
  { href: "/business/properties", label: "Properties", icon: Building2 },
  { href: "/business#bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/business#analytics", label: "Analytics", icon: BarChart3 },
];

export default function BusinessDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role !== "BUSINESS_OWNER") router.replace("/dashboard");
  }, [user, router]);

  const {
    data: properties,
    isFetched: propertiesFetched,
    isError: propertiesError,
    isLoading: propertiesLoading,
  } = useQuery({
    queryKey: ["owner-properties"],
    queryFn: () => api<Property[]>("/properties/owner/me"),
    enabled: user?.role === "BUSINESS_OWNER",
  });

  const { data: bookings } = useQuery({
    queryKey: ["owner-bookings"],
    queryFn: () => api<Booking[]>("/bookings/owner"),
    enabled: user?.role === "BUSINESS_OWNER",
  });

  const { data: analytics } = useQuery({
    queryKey: ["owner-analytics"],
    queryFn: () => api<OwnerAnalytics>("/analytics/owner"),
    enabled: user?.role === "BUSINESS_OWNER",
  });

  const isDemo = useHostDemo(properties, { isFetched: propertiesFetched, isError: propertiesError });
  const displayProperties = isDemo ? DEMO_HOST_PROPERTIES : (properties ?? []);
  const displayBookings = isDemo ? DEMO_HOST_BOOKINGS : (bookings ?? []);
  const displayAnalytics = isDemo ? DEMO_HOST_ANALYTICS : (analytics ?? DEMO_HOST_ANALYTICS);

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api(`/bookings/${id}/confirm`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-bookings"] }),
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => api(`/properties/${id}/submit`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-properties"] }),
    onError: (e: Error) => {
      toast({ title: "Cannot submit", description: e.message, variant: "error" });
    },
  });

  if (!user || user.role !== "BUSINESS_OWNER") return null;

  const totalRooms = displayProperties.reduce((s, p) => s + (p.rooms?.length ?? 0), 0) ?? 0;

  return (
    <DashboardShell
      sidebar={<DashboardSidebar items={nav} title="Business Owner" />}
      heading="Business Dashboard"
      subheading="Manage properties, rooms, and revenue"
    >
      {isDemo && <DemoDataBanner />}
      {(isDemo || displayProperties.length === 0) && <HostListingGuide className="mb-8" compact />}
      {propertiesLoading && !isDemo ? (
        <div className="space-y-6 mb-10">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
          </div>
        </div>
      ) : (
        <>
      <div id="analytics" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-10">
        <StatWidget label="Revenue" value={formatCurrency(displayAnalytics.revenue ?? 0)} icon={BarChart3} trend="up" change="+12% vs last month" />
        <StatWidget label="Occupancy" value={`${displayAnalytics.occupancyRate ?? 0}%`} icon={BedDouble} trend="neutral" />
        <StatWidget label="Bookings" value={displayAnalytics.totalBookings ?? 0} icon={CalendarCheck} trend="up" change={`${displayAnalytics.pendingBookings ?? 0} pending`} />
        <StatWidget label="Properties" value={displayProperties.length ?? 0} icon={Building2} trend="neutral" change={`${totalRooms} rooms`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <GlassCard hover={false} className="p-6">
          <h3 className="font-display font-semibold mb-4">Booking trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayAnalytics.bookingTrends ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="transparent" />
                <YAxis tick={{ fill: "#94a3b8" }} stroke="transparent" />
                <Tooltip contentStyle={{ borderRadius: "1rem", background: "#12121a", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#ec4899" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard hover={false} className="p-6">
          <h3 className="font-display font-semibold mb-4">Popular room types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayAnalytics.popularRoomTypes ?? []}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: "#94a3b8" }} stroke="transparent" />
                <YAxis tick={{ fill: "#94a3b8" }} stroke="transparent" />
                <Tooltip contentStyle={{ borderRadius: "1rem", background: "#12121a", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <section id="bookings" className="mb-10">
        <h2 className="font-display text-xl font-bold mb-4">Reservations</h2>
        <div className="space-y-3">
          {displayBookings.map((b) => (
            <GlassCard key={b.id} hover={false} className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{b.property?.name}</p>
                <p className="text-sm text-muted">{formatDate(b.checkIn)} · {b.guests} guests</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={b.status === "CONFIRMED" ? "success" : "warning"}>{b.status}</Badge>
                {b.status === "PENDING" && !isDemo && (
                  <Button size="sm" onClick={() => confirmMutation.mutate(b.id)}>Confirm</Button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="properties">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">
            {isDemo ? "Example listings" : "Your properties"}
          </h2>
          <Link href="/business/properties">
            <Button size="sm" className="rounded-xl">Manage all</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {displayProperties.map((p) => (
            <GlassCard key={p.id} hover={false} className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display font-semibold">{p.name}</p>
                <p className="text-sm text-muted">{p.city}, {p.country} · {p.rooms?.length ?? 0} rooms</p>
              </div>
              <div className="flex items-center gap-3">
                {isDemo && <Badge variant="outline">Example</Badge>}
                <Badge variant={p.status === "APPROVED" ? "success" : "warning"}>{p.status}</Badge>
                {p.status === "DRAFT" && !isDemo && (
                  <Button
                    size="sm"
                    disabled={(p.rooms?.length ?? 0) === 0}
                    onClick={() => submitMutation.mutate(p.id)}
                  >
                    Submit for review
                  </Button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
        </>
      )}
    </DashboardShell>
  );
}
