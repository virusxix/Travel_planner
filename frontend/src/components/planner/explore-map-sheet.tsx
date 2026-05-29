"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PlannerVenueCard } from "@/components/planner/planner-venue-card";
import { cn } from "@/lib/utils";

const TABS = ["For you", "Things to do", "Restaurants", "Stays"] as const;

export type ExploreVenue = {
  id: string;
  title: string;
  imageUrl?: string | null;
  category?: string | null;
};

export function ExploreMapSheet({
  venues,
  destination,
}: {
  venues: ExploreVenue[];
  destination?: string;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("For you");
  const [expanded, setExpanded] = useState(false);

  const filtered =
    tab === "For you"
      ? venues
      : tab === "Things to do"
        ? venues.filter(
            (v) =>
              v.category === "culture" ||
              v.category === "attraction" ||
              !v.category
          )
        : tab === "Restaurants"
          ? venues.filter((v) => v.category === "food")
          : venues.filter((v) => v.category === "hotel" || v.category === "stay");

  const things = filtered.length ? filtered : venues;

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 z-20 pointer-events-none flex flex-col justify-end",
        "lg:hidden",
        expanded ? "max-h-[42%]" : "max-h-[88px]"
      )}
    >
      <div className="pointer-events-auto glass-sheet rounded-t-[24px] border-t border-white/[0.1] shadow-[0_-8px_32px_rgba(0,0,0,0.35)] flex flex-col min-h-0">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex justify-center pt-2.5 pb-1 w-full"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          )}
        </button>

        <div className="px-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all",
                tab === t ? "pill-active" : "pill-inactive"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {expanded && (
          <div className="overflow-y-auto scrollbar-hide px-3 pb-3 max-h-[28vh]">
            {destination && (
              <p className="text-[11px] text-slate-400 mb-2">
                <span className="text-white font-medium">{destination}</span>
              </p>
            )}
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide">
              {things.length ? (
                things.map((v) => (
                  <PlannerVenueCard key={v.id} title={v.title} imageUrl={v.imageUrl} />
                ))
              ) : (
                <p className="text-xs text-slate-500 py-2">Loading places…</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
