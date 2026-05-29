"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Compass, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "How It Works" },
  { href: "/hidden-gems", label: "Our Offers" },
  { href: "/search", label: "Top Destination" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "BUSINESS_OWNER"
        ? "/business"
        : user
          ? "/dashboard"
          : null;

  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-4 py-4 md:px-8",
        isHome ? "bg-transparent absolute inset-x-0" : "glass-strong"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white shadow-[0_4px_14px_rgba(29,133,228,0.4)]">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
            HIDDEN<span className="text-brand-500">STAY</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-brand-500",
                pathname === link.href || (link.href === "/" && pathname === "/")
                  ? "text-brand-500"
                  : "text-slate-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {mounted && (
            <button
              type="button"
              className="icon-btn-glass hidden md:flex"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          {user ? (
            <>
              {dashboardHref && (
                <Link href={dashboardHref}>
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                    Dashboard
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={logout} className="hidden md:inline-flex">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-2xl px-5">
                  Register Now
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
