"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Compass, Sun, Moon, LogOut } from "lucide-react";
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
  const { theme, setTheme } = useTheme();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-surface-elevated lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-btn text-white">
          <Compass className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-sm font-bold">HiddenStay AI</p>
          <p className="text-xs text-muted">{title}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                active
                  ? "gradient-btn text-white shadow-glow"
                  : "text-muted hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4 space-y-2">
        {user && (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
            <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <Link href="/" className="block text-center text-xs text-muted hover:text-primary-600 py-2">
          ← Back to site
        </Link>
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
    <div className="min-h-screen bg-surface">
      {sidebar}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border glass-strong px-6 py-5 lg:px-8">
          <h1 className="font-display text-2xl font-bold tracking-tight">{heading}</h1>
          {subheading && <p className="mt-1 text-sm text-muted">{subheading}</p>}
        </header>
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
