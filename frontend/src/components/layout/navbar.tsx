"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";
import { isNightRoute } from "@/lib/theme-routes";
import { BackButton, HomeButton } from "@/components/layout/back-button";

const NAV_LINKS = [
  { href: "/hidden-gems", label: "Experiences" },
  { href: "/planner", label: "Planner" },
  { href: "/#about", label: "About" },
];

export function Navbar({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const showBack = pathname !== "/";
  const isHome = pathname === "/";
  // dark chrome on all night routes; transparent only on the home hero
  const isDark = isNightRoute(pathname);

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "BUSINESS_OWNER"
        ? "/business"
        : user
          ? "/dashboard"
          : null;

  return (
    <header
      className={cn(
        "z-50 bg-transparent px-3 pt-3 sm:px-5",
        isHome ? "absolute inset-x-0 top-0" : "sticky top-0"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-4 rounded-2xl px-4 backdrop-blur-xl transition-colors",
          isHome
            ? "border border-white/10 bg-[#0a1622]/45"
            : isDark
              ? "border border-white/10 bg-[#0a1622]/55"
              : "border border-slate-200/80 bg-white/60",
          compact ? "h-12" : "h-14"
        )}
        style={isHome || isDark ? undefined : { boxShadow: "var(--shadow-y-nav)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {showBack && <BackButton className={cn("shrink-0", isDark && "border-transparent bg-transparent text-white hover:bg-white/10")} />}
          {showBack && <HomeButton className={cn("shrink-0 sm:hidden", isDark && "border-transparent bg-transparent text-white hover:bg-white/10")} />}
          <Link href="/" className="flex items-center shrink-0">
            <span
              className={cn(
                "text-xl font-extrabold tracking-tight",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              HiddenStay
            </span>
          </Link>
        </div>

        <nav className={cn("items-center gap-1", compact ? "hidden xl:flex" : "hidden md:flex")}>
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href === "/hidden-gems" && pathname.startsWith("/hidden-gems")) ||
              (link.href === "/planner" && pathname.startsWith("/planner"));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                  isDark
                    ? active
                      ? "text-white bg-white/15"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                    : active
                      ? "text-brand-600 bg-blue-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {showBack && <HomeButton className={cn("hidden sm:inline-flex", isDark && "border-transparent bg-transparent text-white hover:bg-white/10")} />}
          {user ? (
            <>
              {dashboardHref && (
                <Link href={dashboardHref}>
                  <Button
                    variant={isDark ? "glass" : "ghost"}
                    size="sm"
                    className={cn("hidden sm:inline-flex", isDark && "border-white/25 text-white bg-white/10 hover:bg-white/20")}
                  >
                    Dashboard
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className={cn("hidden md:inline-flex", isDark ? "text-white/90 hover:bg-white/10" : "")}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className={isDark ? "text-white/90 hover:bg-white/10 hover:text-white" : ""}
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className={isDark ? "bg-white text-slate-900 hover:bg-white/90" : ""}
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
