"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
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
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 xl:p-10 h-full min-h-[560px]">
      <div className="relative">
        <p className="section-label">Example stays</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-stone-900 leading-tight tracking-tight">
          {variant === "owner" ? (
            <>List authentic stays.<br /><span className="text-brand-700">Only 5% commission.</span></>
          ) : (
            <>Hidden gems,<br /><span className="text-brand-700">not chain hotels.</span></>
          )}
        </h2>
        <p className="mt-4 max-w-md text-sm text-stone-500 leading-relaxed">
          {variant === "owner"
            ? "Sample listings for inspiration. Add your own properties after signing up."
            : "Homestays, eco-lodges, and boutique inns across Asia — curated for slow travelers."}
        </p>
      </div>

      <div className="relative mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={stay.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.06]"
          >
            <div className="relative aspect-[16/10]">
              <Image src={stay.image} alt={stay.name} fill className="object-cover" sizes="400px" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-medium text-stone-900">{stay.name}</h3>
                <span className="text-sm font-semibold text-stone-900">{formatCurrency(stay.price)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-sm text-stone-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {stay.city}, {stay.country}
                </span>
                <span className="flex items-center gap-1 font-medium text-stone-700">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {stay.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
