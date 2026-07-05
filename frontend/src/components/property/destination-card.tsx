"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Property } from "@/types";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/property/favorite-button";

export function DestinationCard({
  property,
  variant = "default",
  className,
  horizontal,
}: {
  property: Property;
  variant?: "default" | "compact" | "featured";
  className?: string;
  horizontal?: boolean;
}) {
  const image = property.images?.[0]?.url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
  const price = property.rooms?.[0]?.basePrice ? Number(property.rooms[0].basePrice) : null;

  const content = (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition-shadow hover:shadow-[var(--shadow-y-float)]",
        horizontal && "flex w-[260px] shrink-0",
        variant === "featured" && "shadow-[var(--shadow-y-float)]"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-stone-100",
          horizontal ? "w-[110px] shrink-0 aspect-square" : "aspect-[4/3]"
        )}
      >
        <Image src={image} alt={property.name} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" sizes="280px" />
        <span className="rating-badge absolute left-2.5 top-2.5 flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {property.avgRating.toFixed(1)}
        </span>
        <div className="absolute right-2.5 top-2.5">
          <FavoriteButton propertyId={property.id} size="sm" />
        </div>
      </div>

      <div className={cn("p-3.5", horizontal && "flex flex-col justify-center min-w-0")}>
        <h3 className="font-medium text-sm text-stone-900 line-clamp-1">{property.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{property.city}, {property.country}</span>
        </p>
        {price != null && !horizontal && (
          <p className="mt-1.5 text-sm font-semibold text-stone-900">
            {formatCurrency(price)}<span className="text-stone-400 font-normal text-xs"> /night</span>
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className={className}>
      <Link href={`/properties/${property.id}`}>{content}</Link>
    </div>
  );
}
