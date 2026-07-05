"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Plus, Building2, LayoutDashboard, BedDouble, CalendarCheck, BarChart3 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { DashboardShell, DashboardSidebar } from "@/components/layout/dashboard-shell";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Property } from "@/types";
import { DEMO_HOST_PROPERTIES, useHostDemo } from "@/lib/business-demo";
import { DemoDataBanner } from "@/components/shared/demo-data-banner";
import { HostListingGuide } from "@/components/business/host-listing-guide";

const nav = [
  { href: "/business", label: "Overview", icon: LayoutDashboard },
  { href: "/business/properties", label: "Properties", icon: Building2 },
  { href: "/business#bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/business#analytics", label: "Analytics", icon: BarChart3 },
];

export default function BusinessPropertiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role !== "BUSINESS_OWNER") router.replace("/dashboard");
  }, [user, router]);

  const { data: properties, isLoading, isFetched, isError } = useQuery({
    queryKey: ["owner-properties"],
    queryFn: () => api<Property[]>("/properties/owner/me"),
    enabled: user?.role === "BUSINESS_OWNER",
  });

  const isDemo = useHostDemo(properties, { isFetched, isError });
  const displayProperties = isDemo ? DEMO_HOST_PROPERTIES : (properties ?? []);

  if (!user) return null;

  return (
    <DashboardShell
      sidebar={<DashboardSidebar items={nav} title="Business Owner" />}
      heading="Your properties"
      subheading="Create and manage accommodations"
    >
      {isDemo && <DemoDataBanner />}
      <HostListingGuide className="mb-6" />
      <div className="flex justify-end mb-6">
        <Link href="/business/properties/new">
          <Button className="rounded-2xl gap-2">
            <Plus className="h-4 w-4" /> Add property
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : !displayProperties.length ? (
        <GlassCard hover={false} className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-violet-400" />
          <p className="mt-4 font-display font-semibold">No properties yet</p>
          <p className="text-sm text-muted mt-2">Add your first stay to start receiving bookings.</p>
          <Link href="/business/properties/new">
            <Button className="mt-6 rounded-2xl">Create property</Button>
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {!isDemo && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-semibold">Your listings</h2>
              {displayProperties.map((p) => (
                <Link key={p.id} href={`/business/properties/${p.id}`}>
                  <GlassCard hover className="p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-display font-semibold">{p.name}</p>
                      <p className="text-sm text-muted">{p.city}, {p.country} · {p.rooms?.length ?? 0} rooms</p>
                    </div>
                    <Badge variant={p.status === "APPROVED" ? "success" : "warning"}>{p.status}</Badge>
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}
          {isDemo && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-semibold text-stone-500">Example listings (preview)</h2>
              {displayProperties.map((p) => (
                <GlassCard key={p.id} hover={false} className="p-5 flex flex-wrap items-center justify-between gap-4 opacity-90">
                  <div>
                    <p className="font-display font-semibold">{p.name}</p>
                    <p className="text-sm text-muted">{p.city}, {p.country} · {p.rooms?.length ?? 0} rooms</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Example</Badge>
                    <Badge variant={p.status === "APPROVED" ? "success" : "warning"}>{p.status}</Badge>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
