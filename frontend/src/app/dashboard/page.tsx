"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Heart,
  MapPin,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { DashboardShell, DashboardSidebar } from "@/components/layout/dashboard-shell";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DestinationCard } from "@/components/property/destination-card";
import { ItineraryCard } from "@/components/itinerary/itinerary-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking, Property } from "@/types";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard#trips", label: "My trips", icon: Calendar },
  { href: "/dashboard#saved", label: "Saved", icon: Heart },
  { href: "/planner", label: "AI Planner", icon: Sparkles },
];

export default function TravelerDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role === "BUSINESS_OWNER") router.replace("/business");
    else if (user.role === "ADMIN") router.replace("/admin");
  }, [user, router]);

  const { data: bookings } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => api<Booking[]>("/bookings/me"),
    enabled: !!user,
  });

  const { data: itineraries } = useQuery({
    queryKey: ["my-itineraries"],
    queryFn: () =>
      api<
        {
          id: string;
          destination: string;
          country: string;
          startDate: string;
          endDate: string;
          totalCost?: number | string | null;
        }[]
      >("/itinerary/me"),
    enabled: !!user,
  });

  const { data: savedProperties } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => api<Property[]>("/favorites"),
    enabled: !!user,
  });

  if (!user) return null;

  const upcoming = bookings?.filter((b) => b.status === "PENDING" || b.status === "CONFIRMED") ?? [];

  return (
    <DashboardShell
      sidebar={<DashboardSidebar items={nav} title="Traveler" />}
      heading={`Welcome back, ${user.firstName}`}
      subheading="Manage trips, saved stays, and AI itineraries"
    >
      <div className="grid gap-6 sm:grid-cols-3 mb-10">
        {[
          { label: "Upcoming trips", value: upcoming.length, icon: Calendar },
          { label: "Saved itineraries", value: itineraries?.length ?? 0, icon: Sparkles },
          { label: "Total bookings", value: bookings?.length ?? 0, icon: MapPin },
        ].map((s) => (
          <GlassCard key={s.label} hover={false} className="p-5">
            <s.icon className="h-5 w-5 text-stone-400 mb-3" />
            <p className="text-sm text-stone-500">{s.label}</p>
            <p className="font-display text-2xl font-semibold mt-1 text-stone-900">{s.value}</p>
          </GlassCard>
        ))}
      </div>

      <section id="trips" className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">Upcoming trips</h2>
          <Link href="/hidden-gems"><Button size="sm">Book a stay</Button></Link>
        </div>
        {upcoming.length === 0 ? (
          <GlassCard hover={false} className="p-10 text-center text-muted">
            No upcoming trips. <Link href="/hidden-gems" className="text-primary-600 font-medium">Explore stays</Link>
          </GlassCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((b) => (
              <GlassCard key={b.id} hover={false} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-display font-semibold text-lg">{b.property?.name}</p>
                    <p className="text-sm text-muted mt-1">
                      {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                    </p>
                  </div>
                  <Badge variant={b.status === "CONFIRMED" ? "success" : "warning"}>{b.status}</Badge>
                </div>
                <p className="mt-4 font-display text-xl font-bold text-primary-600">
                  {formatCurrency(Number(b.finalTotal))}
                </p>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      <section id="saved" className="mb-12">
        <h2 className="font-display text-xl font-bold mb-6">Saved properties</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedProperties?.map((p) => (
            <DestinationCard key={p.id} property={p} variant="compact" />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">AI itineraries</h2>
          <Link href="/planner"><Button variant="secondary" size="sm">New plan</Button></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {itineraries?.length === 0 && (
            <GlassCard hover={false} className="p-8 text-muted col-span-2 text-center">
              No itineraries yet. Try the AI planner!
            </GlassCard>
          )}
          {itineraries?.map((it) => (
            <ItineraryCard key={it.id} itinerary={it} />
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
