"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Sparkles, Star } from "lucide-react";
import { AUTH_EXAMPLE_STAYS } from "@/lib/auth-examples";
import { formatCurrency } from "@/lib/utils";

export function AuthShowcase({ variant = "traveler" }: { variant?: "traveler" | "owner" }) {
  const [index, setIndex] = useState(0);
  const stay = AUTH_EXAMPLE_STAYS[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % AUTH_EXAMPLE_STAYS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-[2rem] y-card p-8 xl:p-10">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-sky-100/50 pointer-events-none" />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
          Example stays
        </p>
        <h2 className="mt-3 font-display text-3xl xl:text-4xl font-extrabold text-foreground leading-tight">
          {variant === "owner" ? (
            <>
              List authentic stays.
              <br />
              <span className="text-brand-500">Only 5% commission.</span>
            </>
          ) : (
            <>
              Hidden gems,
              <br />
              <span className="text-brand-500">not chain hotels.</span>
            </>
          )}
        </h2>
        <p className="mt-4 max-w-md text-sm text-muted leading-relaxed">
          {variant === "owner"
            ? "These are sample listings shown for inspiration. Add your own properties after signing up."
            : "Explore homestays, eco-lodges, and boutique inns across Asia — curated for slow travelers."}
        </p>
      </div>

      <div className="relative mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={stay.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-soft"
          >
            <div className="relative aspect-[16/10]">
              <Image src={stay.image} alt={stay.name} fill className="object-cover" sizes="540px" />
              <span className="absolute left-4 top-4 flex items-center gap-1 rounded-xl bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {stay.rating.toFixed(1)}
              </span>
              <span className="absolute right-4 top-4 rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">
                {stay.type}
              </span>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-5">
                <h3 className="font-display text-xl font-bold text-white">{stay.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-200">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {stay.city}, {stay.country}
                </p>
                <p className="mt-3 font-display text-lg font-bold text-white">
                  {formatCurrency(stay.price)}
                  <span className="text-sm font-normal text-slate-300"> /night</span>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            {AUTH_EXAMPLE_STAYS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${item.name}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-8 bg-brand-500" : "w-2 bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Sparkles className="h-3.5 w-3.5" />
            Preview only
          </p>
        </div>
      </div>

      <div className="relative mt-8 grid grid-cols-3 gap-3">
        {[
          { value: "5%", label: "Commission" },
          { value: "12+", label: "Countries" },
          { value: "AI", label: "Trip planner" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-4 text-center"
          >
            <p className="font-display text-lg font-bold text-foreground">{stat.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
