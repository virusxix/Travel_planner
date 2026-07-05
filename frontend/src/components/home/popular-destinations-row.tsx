"use client";

import { forwardRef } from "react";
import { PopularDestinationCard } from "@/components/home/popular-destination-card";
import { POPULAR_DESTINATIONS } from "@/lib/home-content";

export const PopularDestinationsRow = forwardRef<HTMLDivElement>(
  function PopularDestinationsRow(_, ref) {
    return (
      <div
        ref={ref}
        className="flex gap-5 overflow-x-auto overflow-y-visible scrollbar-hide py-1 pb-3 snap-x snap-mandatory scroll-smooth"
        style={{ scrollPaddingInline: "0 1rem" }}
      >
        {POPULAR_DESTINATIONS.map((dest) => (
          <PopularDestinationCard key={dest.id} {...dest} />
        ))}
      </div>
    );
  }
);
