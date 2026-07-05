"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { UNSPLASH } from "@/lib/unsplash-images";

const FALLBACK_SRC = UNSPLASH.destinationFallback;

export function PopularDestinationCard({
  name,
  image,
  href,
}: {
  name: string;
  image: string;
  href: string;
}) {
  const [src, setSrc] = useState(image);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  function handleError() {
    if (src !== FALLBACK_SRC) {
      setSrc(FALLBACK_SRC);
      return;
    }
    setShowPlaceholder(true);
  }

  return (
    <article className="shrink-0 w-[220px] sm:w-[240px] snap-start">
      <Link
        href={href}
        className="group block overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-200">
          {!showPlaceholder ? (
            <Image
              src={src}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="240px"
              onError={handleError}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-100 text-stone-400">
              <MapPin className="h-6 w-6" />
              <span className="text-xs font-medium">{name}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/70 to-transparent pt-16 pb-4 px-4">
            <p className="font-display text-lg font-semibold text-white">{name}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
