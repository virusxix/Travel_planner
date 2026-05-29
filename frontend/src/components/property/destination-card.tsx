"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
        "group overflow-hidden rounded-[1.75rem] y-card transition-all hover:-translate-y-1",
        horizontal && "flex w-[280px] shrink-0",
        variant === "featured" && "shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-slate-800",
          horizontal ? "w-[120px] shrink-0 aspect-square" : "aspect-[4/3]"
        )}
      >
        <Image src={image} alt={property.name} fill className="object-cover" sizes="280px" />
        <span className="rating-badge absolute left-3 top-3 flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {property.avgRating.toFixed(1)}
        </span>
        <div className="absolute right-3 top-3">
          <FavoriteButton propertyId={property.id} size="sm" />
        </div>
      </div>

      <div className={cn("p-4", horizontal && "flex flex-col justify-center min-w-0")}>
        <h3 className="font-display font-semibold text-sm line-clamp-1">{property.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{property.city}, {property.country}</span>
        </p>
        {price != null && !horizontal && (
          <p className="mt-2 font-display font-bold text-sm text-brand-500">
            {formatCurrency(price)}<span className="text-muted font-normal text-xs"> /night</span>
          </p>
        )}
      </div>
    </div>
  );

  return (
    <motion.div whileTap={{ scale: 0.98 }} className={className}>
      <Link href={`/properties/${property.id}`}>{content}</Link>
    </motion.div>
  );
}
