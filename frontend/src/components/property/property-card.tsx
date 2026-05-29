import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function PropertyCard({ property }: { property: Property }) {
  const image = property.images?.[0]?.url || "/placeholder-stay.jpg";
  const price = property.rooms?.[0]?.basePrice
    ? Number(property.rooms[0].basePrice)
    : null;

  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={image}
            alt={property.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <Badge className="absolute left-3 top-3 capitalize">
            {property.type.replace(/_/g, " ").toLowerCase()}
          </Badge>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 line-clamp-1">{property.name}</h3>
            <div className="flex shrink-0 items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{property.avgRating.toFixed(1)}</span>
            </div>
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {property.city}, {property.country}
          </p>
          {price != null && (
            <p className="mt-2 text-sm">
              <span className="font-semibold text-slate-900">{formatCurrency(price)}</span>
              <span className="text-slate-500"> / night</span>
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
