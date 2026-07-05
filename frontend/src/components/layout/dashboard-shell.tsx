"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";

export function DashboardSidebar({
  items,
  title,
}: {
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  title: string;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 p-3 lg:flex">
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1622]/60 backdrop-blur-xl">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <div>
          <Link href="/" className="font-display text-base font-semibold text-white">
            HiddenStay
          </Link>
          <p className="text-xs text-white/40 mt-0.5">{title}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-2">
        {user && (
          <div className="rounded-lg bg-white/5 px-3 py-2.5">
            <p className="text-sm font-medium text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start text-white/70 hover:bg-white/5 hover:text-white" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
      </div>
      </div>
    </aside>
  );
}

export function DashboardShell({
  sidebar,
  children,
  heading,
  subheading,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  heading: string;
  subheading?: string;
}) {
  return (
    <div className="min-h-screen">
      {sidebar}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a1622]/60 backdrop-blur-xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">{heading}</h1>
          {subheading && <p className="mt-1 text-sm text-white/55">{subheading}</p>}
        </header>
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
