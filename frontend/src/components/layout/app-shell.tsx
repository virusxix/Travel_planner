"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { BottomNav } from "./bottom-nav";

const DASHBOARD_PREFIXES = ["/dashboard", "/business", "/admin"];
const HIDE_FOOTER = ["/search", "/planner"];
const IMMERSIVE = ["/planner"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuth = pathname === "/login" || pathname === "/register";
  const isImmersive = IMMERSIVE.some((p) => pathname.startsWith(p));
  const showBottomNav = !isDashboard && !isAuth && !isImmersive;
  const showFooter = !isDashboard && !isAuth && !HIDE_FOOTER.some((p) => pathname.startsWith(p));
  const showNavbar = !isAuth && !isImmersive;

  if (isDashboard) {
    return <>{children}</>;
  }

  if (isImmersive) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {showNavbar && <Navbar />}
      <main className={cn("flex-1", showBottomNav && "pb-24 md:pb-0")}>{children}</main>
      {showFooter && <Footer />}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
