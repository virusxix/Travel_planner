"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { BottomNav } from "./bottom-nav";

const DASHBOARD_PREFIXES = ["/dashboard", "/business", "/admin"];
const HIDE_FOOTER = ["/planner"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuth = pathname === "/login" || pathname === "/register";
  const isPlanner = pathname.startsWith("/planner");
  const showBottomNav = !isDashboard && !isAuth && !isPlanner;
  const showFooter = !isDashboard && !isAuth && !HIDE_FOOTER.some((p) => pathname.startsWith(p));

  if (isDashboard) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="lg:hidden">
          <Navbar compact />
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar compact={isPlanner || isAuth} />
      <main
        className={cn(
          "flex flex-1 flex-col min-h-0",
          showBottomNav && "pb-24 md:pb-0"
        )}
      >
        {children}
      </main>
      {showFooter && <Footer />}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
