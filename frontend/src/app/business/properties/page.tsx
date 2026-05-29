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

  const { data: properties, isLoading } = useQuery({
    queryKey: ["owner-properties"],
    queryFn: () => api<Property[]>("/properties/owner/me"),
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <DashboardShell
      sidebar={<DashboardSidebar items={nav} title="Business Owner" />}
      heading="Your properties"
      subheading="Create and manage accommodations"
    >
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
            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : !properties?.length ? (
        <GlassCard hover={false} className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-violet-400" />
          <p className="mt-4 font-display font-semibold">No properties yet</p>
          <p className="text-sm text-muted mt-2">Add your first stay to start receiving bookings.</p>
          <Link href="/business/properties/new">
            <Button className="mt-6 rounded-2xl">Create property</Button>
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
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
    </DashboardShell>
  );
}
