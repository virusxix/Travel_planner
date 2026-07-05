"use client";

import Image from "next/image";
import { Heart, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlannerVenueCard({
  title,
  imageUrl,
  rating = 4.8,
  mapOrder,
  className,
}: {
  title: string;
  imageUrl?: string | null;
  rating?: number;
  mapOrder?: number;
  className?: string;
}) {
  const src =
    imageUrl ||
    `https://images.unsplash.com/photo-1502602898657-3e91760c34df?w=400&q=80`;

  return (
    <article
      className={cn(
        "relative shrink-0 w-[140px] rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-sm",
        className
      )}
    >
      <div className="relative h-[100px] w-full">
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover"
          sizes="140px"
          unoptimized={src.includes("googleusercontent") || src.includes("places.googleapis")}
        />
        <span className="rating-badge absolute top-2 left-2 flex items-center gap-0.5">
          <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
          {rating.toFixed(1)}
        </span>
        {mapOrder != null && (
          <span className="absolute bottom-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow">
            {mapOrder}
          </span>
        )}
        <button
          type="button"
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600"
          aria-label="Save"
        >
          <Heart className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-2.5 flex items-center justify-between gap-1">
        <p className="text-[11px] font-semibold text-white truncate flex-1">{title}</p>
        <button
          type="button"
          className="h-6 w-6 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white/70"
          aria-label="Add to trip"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}
