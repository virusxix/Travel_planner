import Link from "next/link";
import { Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-extrabold text-foreground">
                HIDDEN<span className="text-brand-500">STAY</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-muted leading-relaxed">
              Empowering small hotels and homestays across Asia with only 5% commission.
            </p>
          </div>
          {[
            {
              title: "Explore",
              links: [
                { href: "/search", label: "Find stays" },
                { href: "/hidden-gems", label: "Hidden gems" },
                { href: "/planner", label: "AI planner" },
              ],
            },
            {
              title: "Hosts",
              links: [
                { href: "/register?role=owner", label: "List property" },
                { href: "/business", label: "Owner dashboard" },
              ],
            },
            {
              title: "Company",
              links: [
                { href: "/#about", label: "About" },
                { href: "/register?role=owner", label: "5% fair commission" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="font-display font-semibold text-foreground">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted hover:text-brand-500 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 border-t border-slate-200 pt-8 text-center text-xs text-muted">
          © {new Date().getFullYear()} HiddenStay AI. Built for authentic travel across Asia.
        </p>
      </div>
    </footer>
  );
}
