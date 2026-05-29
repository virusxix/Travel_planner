"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";

const FALLBACK_BY_CATEGORY: Record<string, string> = {
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop&q=80",
  culture: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=200&h=200&fit=crop&q=80",
  experience: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200&h=200&fit=crop&q=80",
  attraction: "https://images.unsplash.com/photo-1565008576549-5751a41d1cdb?w=200&h=200&fit=crop&q=80",
  transport: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=200&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1476519336417-7f646fd03b09?w=200&h=200&fit=crop&q=80",
};

function pickSrc(activity: {
  category?: string | null;
  imageUrl?: string | null;
}): string {
  if (activity.imageUrl?.trim()) return activity.imageUrl.trim();
  const cat = activity.category?.toLowerCase() ?? "";
  return FALLBACK_BY_CATEGORY[cat] ?? FALLBACK_BY_CATEGORY.default;
}

function isExternalPhoto(url: string) {
  return /googleusercontent\.com|maps\.googleapis\.com|places\.googleapis\.com/i.test(
    url
  );
}

export function ActivityThumbnail({
  title,
  category,
  imageUrl,
}: {
  title: string;
  category?: string | null;
  imageUrl?: string | null;
}) {
  const initial = pickSrc({ category, imageUrl });
  const [src, setSrc] = useState(initial);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-[#252530] flex items-center justify-center">
        <MapPin className="h-6 w-6 text-slate-500" />
      </div>
    );
  }

  return (
    <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-[#252530]">
      <Image
        src={src}
        alt={title}
        fill
        className="object-cover"
        sizes="64px"
        unoptimized={isExternalPhoto(src)}
        onError={() => {
          const fallback =
            FALLBACK_BY_CATEGORY[category?.toLowerCase() ?? ""] ??
            FALLBACK_BY_CATEGORY.default;
          if (src !== fallback) {
            setSrc(fallback);
          } else {
            setFailed(true);
          }
        }}
      />
    </div>
  );
}
