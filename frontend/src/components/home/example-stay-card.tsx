"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { AuthExampleStay } from "@/lib/auth-examples";
import type { Property } from "@/types";
export function ExampleStayCard({
  stay,
  preview = true,
  href,
}: {
  stay: AuthExampleStay;
  preview?: boolean;
  href?: string;
}) {
  const card = (
    <div className="y-card-hover overflow-hidden group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={stay.image}
          alt={stay.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="400px"
        />
        {preview && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            Preview
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-foreground line-clamp-1">{stay.name}</h3>
          <span className="shrink-0 font-display text-lg font-bold text-brand-500">
            {formatCurrency(stay.price)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-sm text-muted">
          <span className="flex items-center gap-1 min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {stay.city}, {stay.country}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 font-medium text-slate-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {stay.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }

  return card;
}

export function PropertyStayCard({ property }: { property: Property }) {
  const image =
    property.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
  const price = property.rooms?.[0]?.basePrice ? Number(property.rooms[0].basePrice) : null;

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="y-card-hover overflow-hidden group">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={image} alt={property.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="400px" />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-bold line-clamp-1">{property.name}</h3>
            {price != null && (
              <span className="shrink-0 font-display text-lg font-bold text-brand-500">
                {formatCurrency(price)}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {property.city}, {property.country}
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {property.avgRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
