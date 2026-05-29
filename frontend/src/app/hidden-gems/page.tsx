"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Star, Search } from "lucide-react";
import { api } from "@/lib/api";
import { Input, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/shared/glass-card";
import { PropertyMap } from "@/components/maps/property-map";
import type { HiddenGem } from "@/types";

export default function HiddenGemsPage() {
  const [city, setCity] = useState("Chiang Mai");
  const [country, setCountry] = useState("Thailand");

  const { data: gems, refetch, isLoading } = useQuery({
    queryKey: ["hidden-gems", city, country],
    queryFn: () =>
      api<HiddenGem[]>(
        `/hidden-gems/recommend?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`
      ),
  });

  const mapCenter = gems?.[0]
    ? { lat: gems[0].latitude, lng: gems[0].longitude }
    : { lat: 18.7883, lng: 98.9853 };

  return (
    <div className="min-h-screen bg-surface">
      <div className="border-b border-border bg-gradient-to-br from-primary-600 to-primary-800 text-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Hidden Gems</h1>
          <p className="mt-2 text-primary-100 max-w-xl">
            Local attractions, restaurants, and experiences curated for authentic travel
          </p>
          <div className="mt-6 flex flex-wrap gap-3 max-w-xl">
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-2xl"
            />
            <Input
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-2xl"
            />
            <Button onClick={() => refetch()} variant="glass" className="text-white border-white/30 rounded-2xl">
              <Search className="h-4 w-4" /> Discover
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <GlassCard hover={false} className="overflow-hidden mb-10 h-[360px]">
          <PropertyMap
            center={mapCenter}
            markers={gems?.map((g) => ({ id: g.id, name: g.name, lat: g.latitude, lng: g.longitude })) ?? []}
            height="360px"
          />
        </GlassCard>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gems?.map((gem, i) => (
              <motion.div key={gem.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <GlassCard hover className="overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={gem.imageUrl || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600"}
                      alt={gem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <Badge variant="outline" className="capitalize">{gem.category.replace(/_/g, " ").toLowerCase()}</Badge>
                    <h3 className="mt-2 font-display font-semibold">{gem.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                      <MapPin className="h-3.5 w-3.5" /> {gem.city}, {gem.country}
                    </p>
                    <p className="mt-2 text-sm text-muted line-clamp-2">{gem.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold">{gem.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex gap-1">
                        {gem.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
