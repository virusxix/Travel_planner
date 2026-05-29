"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, MapPin, Phone, Mail, Wifi, Check, Share2 } from "lucide-react";
import { FavoriteButton } from "@/components/property/favorite-button";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PillTabs } from "@/components/ui/pill-tabs";
import { PropertyMap } from "@/components/maps/property-map";
import { formatCurrency } from "@/lib/utils";
import type { Property } from "@/types";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [tab, setTab] = useState<"overview" | "guides" | "restaurants" | "reviews">("overview");

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => api<Property>(`/properties/${id}`),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () =>
      api<{
        reviews: { id: string; rating: number; title?: string; content: string; user: { firstName: string; lastName: string } }[];
      }>(`/reviews/property/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface p-8 flex items-center justify-center">
        <div className="w-full max-w-md h-[420px] rounded-[1.75rem] bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!property) return <div className="p-8 text-center text-muted">Property not found</div>;

  const images = property.images?.length
    ? property.images
    : [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200" }];

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-12">
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-[4/5] max-h-[440px] w-full overflow-hidden rounded-[1.75rem] shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
        >
          <Image
            src={images[selectedImage]?.url || images[0].url}
            alt={property.name}
            fill
            className="object-cover"
            priority
          />
          <span className="rating-badge absolute left-4 top-4 flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {property.avgRating.toFixed(1)}/5
          </span>
          <div className="absolute right-4 top-4 flex gap-2">
            <FavoriteButton propertyId={property.id} />
            <button type="button" className="icon-btn-glass"><Share2 className="h-4 w-4" /></button>
          </div>
        </motion.div>

        <div className="flex justify-center gap-2 mt-4">
          {images.slice(0, 5).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedImage(i)}
              className={`h-2 rounded-full transition-all ${selectedImage === i ? "w-6 bg-white" : "w-2 bg-white/30"}`}
            />
          ))}
        </div>

        <PillTabs
          tabs={[
            { id: "overview" as const, label: "Overview" },
            { id: "guides" as const, label: "Guides" },
            { id: "restaurants" as const, label: "Restaurants" },
            { id: "reviews" as const, label: "Reviews" },
          ]}
          active={tab}
          onChange={setTab}
          className="mt-6"
        />

        <div className="mt-5">
          <h1 className="font-display text-2xl font-bold">{property.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-muted text-sm">
            <MapPin className="h-4 w-4" /> {property.city}, {property.country}
          </p>
          <p className="mt-1 text-sm">
            <span className="text-amber-400 font-semibold">{property.avgRating.toFixed(1)}/5</span>
            <span className="text-muted"> ({property.reviewCount} reviews)</span>
          </p>
        </div>

        {tab === "overview" && (
          <div className="mt-6 space-y-5">
            <p className="text-muted text-sm leading-relaxed">
              {property.description}
              <button type="button" className="text-violet-400 ml-1 font-medium">See more</button>
            </p>
            {property.amenities && (
              <div className="grid grid-cols-2 gap-2">
                {property.amenities.map((a) => (
                  <div key={a.amenity.id} className="flex items-center gap-2 text-sm text-muted">
                    <Check className="h-4 w-4 text-violet-400 shrink-0" /> {a.amenity.name}
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-3">
              <h2 className="font-display font-semibold">Rooms</h2>
              {property.rooms?.map((room) => (
                <div key={room.id} className="glass-card p-4 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{room.name}</p>
                    <p className="text-xs text-muted">{room.roomType} · {room.capacity} guests</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold gradient-brand-text text-sm">{formatCurrency(Number(room.basePrice))}</p>
                    <Button size="sm" className="mt-2" onClick={() => router.push(`/book/${room.id}?propertyId=${property.id}`)}>
                      Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[1.25rem] overflow-hidden h-44">
              <PropertyMap
                center={{ lat: property.latitude, lng: property.longitude }}
                markers={[{ id: property.id, name: property.name, lat: property.latitude, lng: property.longitude }]}
                height="176px"
              />
            </div>
            <div className="glass-card p-4 space-y-2 text-sm text-muted">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-violet-400" /> {property.contactPhone}</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-violet-400" /> {property.contactEmail}</p>
              <p className="flex items-center gap-2"><Wifi className="h-4 w-4 text-violet-400" /> WiFi included</p>
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className="mt-6 space-y-3">
            {reviewsData?.reviews.map((r) => (
              <div key={r.id} className="glass-card p-4">
                <p className="font-medium text-sm">{r.user.firstName} {r.user.lastName}</p>
                <div className="flex gap-0.5 my-1">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted">{r.content}</p>
              </div>
            ))}
          </div>
        )}

        {(tab === "guides" || tab === "restaurants") && (
          <p className="mt-6 text-sm text-muted">
            Local {tab} in {property.city} — browse our{" "}
            <Link href="/hidden-gems" className="text-violet-400 font-medium">Hidden Gems</Link> collection.
          </p>
        )}
      </div>
    </div>
  );
}
