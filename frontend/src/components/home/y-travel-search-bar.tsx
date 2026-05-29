"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BedDouble,
  Calendar,
  MapPin,
  Sparkles,
  Users,
  Gem,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchTab = "stays" | "planner" | "gems";

const TABS: { id: SearchTab; label: string; icon: typeof BedDouble }[] = [
  { id: "stays", label: "Stays", icon: BedDouble },
  { id: "planner", label: "AI Planner", icon: Sparkles },
  { id: "gems", label: "Hidden Gems", icon: Gem },
];

export function YTravelSearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<SearchTab>("stays");
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");

  function handleDiscover(e: React.FormEvent) {
    e.preventDefault();
    if (tab === "planner") {
      router.push("/planner");
      return;
    }
    if (tab === "gems") {
      const q = destination ? `?city=${encodeURIComponent(destination)}` : "";
      router.push(`/hidden-gems${q}`);
      return;
    }
    const q = new URLSearchParams();
    if (destination) q.set("city", destination);
    if (checkIn) q.set("checkIn", checkIn);
    if (checkOut) q.set("checkOut", checkOut);
    if (guests) q.set("guests", guests);
    router.push(`/search?${q}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn("w-full max-w-5xl mx-auto", className)}
    >
      <form
        onSubmit={handleDiscover}
        className="y-card rounded-[2rem] p-2 sm:p-3 glow-border"
      >
        <div className="flex flex-wrap gap-1 px-2 pt-1 pb-3 sm:px-3">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-500/10 text-brand-600"
                    : "text-muted hover:bg-slate-50"
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-brand-500")} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-stretch gap-2">
          <SearchField
            icon={MapPin}
            label="Destination"
            placeholder="City or destination"
          >
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Chiang Mai, Hoi An..."
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-slate-400"
            />
          </SearchField>

          {tab === "stays" && (
            <>
              <Divider />
              <SearchField icon={Calendar} label="Check in" placeholder="Select date">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
                />
              </SearchField>
              <Divider />
              <SearchField icon={Calendar} label="Check out" placeholder="Select date">
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
                />
              </SearchField>
              <Divider />
              <SearchField icon={Users} label="Traveler" placeholder="1 person">
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "person" : "people"}
                    </option>
                  ))}
                </select>
              </SearchField>
            </>
          )}

          <div className="flex items-center p-2 lg:pl-0">
            <Button type="submit" size="lg" className="w-full lg:w-auto rounded-[1.25rem] px-8">
              Discover
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {["Chiang Mai", "Hoi An", "Pai", "Luang Prabang"].map((city) => (
          <Link
            key={city}
            href={`/search?city=${encodeURIComponent(city)}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm hover:border-brand-500/40 hover:text-brand-600 transition-colors"
          >
            {city}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

function SearchField({
  icon: Icon,
  label,
  placeholder,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-w-[140px] items-center gap-3 rounded-[1.25rem] px-4 py-3 lg:py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        {children ?? (
          <p className="mt-0.5 text-sm text-slate-400">{placeholder}</p>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="hidden lg:block w-px self-stretch bg-slate-200 my-3" />;
}
