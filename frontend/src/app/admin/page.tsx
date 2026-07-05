"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  BarChart3,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { DashboardShell, DashboardSidebar } from "@/components/layout/dashboard-shell";
import { StatWidget } from "@/components/shared/stat-widget";
import { DataTable } from "@/components/shared/data-table";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Property } from "@/types";
import {
  DEMO_ADMIN_ANALYTICS,
  DEMO_ADMIN_PENDING,
  DEMO_ADMIN_USERS,
  useAdminDemo,
} from "@/lib/admin-demo";
import { DemoDataBanner } from "@/components/shared/demo-data-banner";

interface AdminAnalytics {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  pendingProperties: number;
  totalRevenue: number;
  platformRevenue: number;
  usersByRole: { role: string; count: number }[];
  bookingsByStatus: { status: string; count: number }[];
}

const COLORS = ["#8b5cf6", "#ec4899", "#f97316", "#a78bfa", "#fb923c"];

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin#approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/admin#users", label: "Users", icon: Users },
  { href: "/admin#analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role !== "ADMIN") router.replace("/dashboard");
  }, [user, router]);

  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api<AdminAnalytics>("/admin/analytics"),
    enabled: user?.role === "ADMIN",
  });

  const { data: pending, isFetched: pendingFetched, isError: pendingError } = useQuery({
    queryKey: ["pending-properties"],
    queryFn: () => api<Property[]>("/admin/properties/pending"),
    enabled: user?.role === "ADMIN",
  });

  const { data: users, isFetched: usersFetched, isError: usersError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api<{ id: string; email: string; role: string; firstName: string; lastName: string; isActive: boolean }[]>("/admin/users"),
    enabled: user?.role === "ADMIN",
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/admin/properties/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminNotes: "Reviewed by admin" }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending-properties"] });
      qc.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
  });

  if (!user || user.role !== "ADMIN") return null;

  const demoPending = useAdminDemo(pending, { isFetched: pendingFetched, isError: pendingError });
  const demoUsers = useAdminDemo(users, { isFetched: usersFetched, isError: usersError });
  const showDemoBanner = demoPending || demoUsers;
  const displayAnalytics = analytics?.totalUsers ? analytics : DEMO_ADMIN_ANALYTICS;
  const displayPending = demoPending ? DEMO_ADMIN_PENDING : (pending ?? []);
  const displayUsers = demoUsers ? DEMO_ADMIN_USERS : (users ?? []);

  return (
    <DashboardShell
      sidebar={<DashboardSidebar items={nav} title="Administrator" />}
      heading="Admin Dashboard"
      subheading="Platform oversight and verification"
    >
      {showDemoBanner && <DemoDataBanner />}
      <div id="analytics" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5 mb-10">
        <StatWidget label="Users" value={displayAnalytics.totalUsers ?? 0} icon={Users} />
        <StatWidget label="Properties" value={displayAnalytics.totalProperties ?? 0} icon={ShieldCheck} />
        <StatWidget label="Bookings" value={displayAnalytics.totalBookings ?? 0} icon={BarChart3} />
        <StatWidget label="Pending" value={displayAnalytics.pendingProperties ?? 0} icon={ShieldCheck} trend="neutral" />
        <StatWidget label="Platform revenue" value={formatCurrency(displayAnalytics.platformRevenue ?? 0)} icon={BarChart3} trend="up" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <GlassCard hover={false} className="p-6">
          <h3 className="font-display font-semibold mb-4">Users by role</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={displayAnalytics.usersByRole ?? []} dataKey="count" nameKey="role" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {(displayAnalytics.usersByRole ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "1rem", background: "#12121a", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard hover={false} className="p-6">
          <h3 className="font-display font-semibold mb-4">Bookings by status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={displayAnalytics.bookingsByStatus ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {(displayAnalytics.bookingsByStatus ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "1rem", background: "#12121a", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <section id="approvals" className="mb-10">
        <h2 className="font-display text-xl font-bold mb-4">Property approvals</h2>
        {!displayPending.length ? (
          <GlassCard hover={false} className="p-10 text-center text-muted">No pending listings.</GlassCard>
        ) : (
          <div className="space-y-4">
            {displayPending.map((p) => (
              <GlassCard key={p.id} hover={false} className="p-6">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="font-display font-semibold text-lg">{p.name}</p>
                    <p className="text-sm text-muted">{p.city}, {p.country} · {p.type}</p>
                    <p className="mt-2 text-sm text-muted line-clamp-2">{p.description}</p>
                  </div>
                  <Badge variant="warning">PENDING</Badge>
                </div>
                {!demoPending && (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" onClick={() => verifyMutation.mutate({ id: p.id, status: "APPROVED" })}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => verifyMutation.mutate({ id: p.id, status: "REJECTED" })}>Reject</Button>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      <section id="users">
        <h2 className="font-display text-xl font-bold mb-4">User management</h2>
        <DataTable
          keyField="id"
          data={displayUsers}
          columns={[
            { key: "firstName", header: "Name", render: (r) => `${r.firstName} ${r.lastName}` },
            { key: "email", header: "Email" },
            { key: "role", header: "Role", render: (r) => <Badge variant="outline">{String(r.role)}</Badge> },
            {
              key: "isActive",
              header: "Status",
              render: (r) => (
                <Badge variant={r.isActive ? "success" : "warning"}>
                  {r.isActive ? "Active" : "Suspended"}
                </Badge>
              ),
            },
          ]}
        />
        <p className="mt-4 text-sm text-muted">
          Total booking volume: {formatCurrency(displayAnalytics.totalRevenue ?? 0)}
        </p>
      </section>
    </DashboardShell>
  );
}
