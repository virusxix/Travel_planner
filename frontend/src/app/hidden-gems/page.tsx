"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Image from "next/image";
import { MapPin, Star, Search } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen">
      <div className="border-b border-white/10">
        <div className="page-container py-12 sm:py-16">
          <p className="section-label mb-2">Local picks</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900 tracking-tight">
            Hidden gems
          </h1>
          <p className="mt-2 text-stone-500 max-w-lg">
            Restaurants, temples, markets, and experiences curated for authentic travel.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 max-w-xl">
            <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="max-w-[160px]" />
            <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="max-w-[160px]" />
            <Button onClick={() => refetch()} variant="secondary">
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </div>
      </div>

      <div className="page-container py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {isLoading && <p className="text-sm text-stone-500">Loading recommendations…</p>}
            {gems?.map((gem) => (
              <article key={gem.id} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/[0.07]">
                {gem.imageUrl && (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    <Image src={gem.imageUrl} alt={gem.name} fill className="object-cover" sizes="80px" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-stone-900">{gem.name}</h3>
                    {gem.rating != null && (
                      <span className="flex items-center gap-1 text-xs font-medium text-stone-600 shrink-0">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {gem.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="mt-1.5">{gem.category}</Badge>
                  <p className="mt-2 text-sm text-stone-500 line-clamp-2">{gem.description}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-stone-400">
                    <MapPin className="h-3 w-3" /> {gem.city}, {gem.country}
                  </p>
                </div>
              </article>
            ))}
            {!isLoading && (!gems || gems.length === 0) && (
              <p className="text-sm text-stone-500 py-8 text-center">No gems found. Try another city.</p>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 h-[400px] lg:h-[560px] sticky top-24">
            <PropertyMap
              center={mapCenter}
              markers={(gems ?? []).map((g) => ({ id: g.id, name: g.name, lat: g.latitude, lng: g.longitude }))}
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
