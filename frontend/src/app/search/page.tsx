"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { DestinationCard } from "@/components/property/destination-card";
import { PropertyMap } from "@/components/maps/property-map";
import { Input, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PillTabs } from "@/components/ui/pill-tabs";
import { apiWithMeta } from "@/lib/api";
import type { Property } from "@/types";

type Category = "for-you" | "stays" | "restaurants" | "things";

const PROPERTY_TYPES = ["HOTEL", "MOTEL", "GUESTHOUSE", "HOMESTAY", "BOUTIQUE_INN", "ECO_LODGE"];

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [city, setCity] = useState(params.get("city") || "");
  const [country, setCountry] = useState(params.get("country") || "");
  const [type, setType] = useState(params.get("type") || "");
  const [category, setCategory] = useState<Category>("for-you");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["properties", city, country, type],
    queryFn: () => {
      const q = new URLSearchParams();
      if (city) q.set("city", city);
      if (country) q.set("country", country);
      if (type) q.set("type", type);
      q.set("limit", "24");
      return apiWithMeta<Property[]>(`/properties?${q}`);
    },
  });

  const properties = data?.data ?? [];
  const mapCenter = properties[0]
    ? { lat: properties[0].latitude, lng: properties[0].longitude }
    : { lat: 18.7883, lng: 98.9853 };

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (city) q.set("city", city);
    if (country) q.set("country", country);
    if (type) q.set("type", type);
    router.push(`/search?${q}`);
    setShowFilters(false);
  }

  return (
    <div className="relative min-h-screen map-dark">
      {/* Full-bleed map background */}
      <div className="fixed inset-0 z-0 pt-16">
        <PropertyMap
          center={mapCenter}
          markers={properties.map((p) => ({ id: p.id, name: p.name, lat: p.latitude, lng: p.longitude }))}
          height="100%"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-transparent to-surface pointer-events-none" />
      </div>

      {/* Bottom sheet — Dribbble explore pattern */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end pointer-events-none">
        <div className="pointer-events-auto mx-0 md:mx-4 mb-0 md:mb-6 max-h-[75vh] overflow-hidden rounded-t-[2rem] md:rounded-[2rem] glass-strong shadow-[0_-16px_64px_rgba(0,0,0,0.5)]">
          <div className="mx-auto w-12 h-1.5 rounded-full bg-white/20 mt-3 mb-4 md:hidden" />

          <div className="px-5 pb-6 overflow-y-auto max-h-[calc(75vh-2rem)] scrollbar-hide">
            <PillTabs
              tabs={[
                { id: "for-you" as Category, label: "For you" },
                { id: "things" as Category, label: "Things to do" },
                { id: "restaurants" as Category, label: "Restaurants" },
                { id: "stays" as Category, label: "Stays" },
              ]}
              active={category}
              onChange={setCategory}
              className="mb-5"
            />

            {showFilters && (
              <form onSubmit={applyFilters} className="glass-card p-4 mb-5 space-y-3">
                <FormField label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} /></FormField>
                <FormField label="Country"><Input value={country} onChange={(e) => setCountry(e.target.value)} /></FormField>
                <FormField label="Type">
                  <Select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="">All</option>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </Select>
                </FormField>
                <Button type="submit" className="w-full">Apply</Button>
              </form>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">
                {category === "stays" ? "Stays" : "Things to do"}
              </h2>
              <button type="button" onClick={() => setShowFilters(!showFilters)} className="icon-btn-glass">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[3/4] rounded-[1.25rem] bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((p) => (
                  <DestinationCard key={p.id} property={p} />
                ))}
              </div>
            )}

            <p className="text-center text-xs text-muted mt-4 pb-4">
              {String(data?.meta?.total ?? properties.length)} results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen map-dark flex items-center justify-center text-muted">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
