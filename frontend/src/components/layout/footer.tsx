"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNightRoute } from "@/lib/theme-routes";
import { cn } from "@/lib/utils";

export function Footer() {
  const dark = isNightRoute(usePathname());
  return (
    <footer
      className={cn(
        "border-t",
        dark ? "theme-night border-white/10 bg-[#0a1622]" : "border-stone-200 bg-white"
      )}
    >
      <div className="page-container py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <span className="font-display text-lg font-semibold text-stone-900">HiddenStay</span>
            <p className="mt-3 text-sm text-stone-500 leading-relaxed max-w-xs">
              Connecting travelers with independent homestays and eco-lodges across Asia. Hosts keep 95%.
            </p>
          </div>
          {[
            {
              title: "Explore",
              links: [
                { href: "/hidden-gems", label: "Find stays" },
                { href: "/hidden-gems", label: "Experiences" },
                { href: "/planner", label: "Trip planner" },
              ],
            },
            {
              title: "Hosts",
              links: [
                { href: "/register?role=owner", label: "List your property" },
                { href: "/business", label: "Owner dashboard" },
              ],
            },
            {
              title: "Company",
              links: [
                { href: "/#about", label: "About us" },
                { href: "/register?role=owner", label: "5% commission" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-stone-900">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200 pt-8">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} HiddenStay. All rights reserved.
          </p>
          <p className="text-xs text-stone-400">Built for authentic travel across Asia</p>
        </div>
      </div>
    </footer>
  );
}
