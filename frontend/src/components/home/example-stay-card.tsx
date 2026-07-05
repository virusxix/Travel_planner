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
    <div className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition-shadow hover:shadow-[var(--shadow-y-float)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <Image
          src={stay.image}
          alt={stay.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="400px"
        />
        {preview && (
          <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium text-stone-600">
            Preview
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium text-stone-900 line-clamp-1">{stay.name}</h3>
          <span className="shrink-0 text-sm font-semibold text-stone-900">
            {formatCurrency(stay.price)}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-sm text-stone-500">
          <span className="flex items-center gap-1 min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{stay.city}, {stay.country}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 font-medium text-stone-700">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {stay.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );

  if (href) return <Link href={href}>{card}</Link>;
  return card;
}

export function PropertyStayCard({ property }: { property: Property }) {
  const image =
    property.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
  const price = property.rooms?.[0]?.basePrice ? Number(property.rooms[0].basePrice) : null;

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition-shadow hover:shadow-[var(--shadow-y-float)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <Image src={image} alt={property.name} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" sizes="400px" />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-medium text-stone-900 line-clamp-1">{property.name}</h3>
            {price != null && (
              <span className="shrink-0 text-sm font-semibold text-stone-900">{formatCurrency(price)}</span>
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-sm text-stone-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {property.city}, {property.country}
            </span>
            <span className="flex items-center gap-1 font-medium text-stone-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {property.avgRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
