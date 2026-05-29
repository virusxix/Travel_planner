"use client";

import { useEffect, useRef, useState } from "react";
import type { Itinerary } from "@/types";
import { api } from "@/lib/api";
import { useGoogleMaps } from "@/components/maps/google-maps-provider";
import { geocodeInBrowser, searchPlaceInBrowser } from "@/lib/places-search";
import { mapPool } from "@/lib/async-pool";

const PLACES_CONCURRENCY = 4;

/**
 * Fills missing activity photos/coordinates via Google Places (browser Maps JS API).
 */
export function useEnrichItineraryPlaces(
  itinerary: Itinerary | null | undefined,
  onUpdated?: (itinerary: Itinerary) => void
) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [enriching, setEnriching] = useState(false);
  const ranForId = useRef<string | null>(null);
  const onUpdatedRef = useRef(onUpdated);
  onUpdatedRef.current = onUpdated;

  useEffect(() => {
    if (loadError || !isLoaded || !itinerary?.id || !itinerary.days?.length) return;
    if (ranForId.current === itinerary.id) return;

    const needsEnrichment = itinerary.days.some((d) =>
      (d.activities ?? []).some(
        (a) => !a.imageUrl || a.latitude == null || a.longitude == null
      )
    );
    if (!needsEnrichment) return;

    ranForId.current = itinerary.id;
    let cancelled = false;

    (async () => {
      setEnriching(true);
      try {
        const bias = await geocodeInBrowser(
          [itinerary.destination, itinerary.country].filter(Boolean).join(", ")
        );

        const toEnrich = (itinerary.days ?? []).flatMap((day) =>
          (day.activities ?? []).filter(
            (a) => !a.imageUrl || a.latitude == null || a.longitude == null
          )
        );

        const found = await mapPool(toEnrich, PLACES_CONCURRENCY, async (activity) => {
          const query = [
            activity.title,
            activity.location,
            itinerary.destination,
            itinerary.country,
          ]
            .filter(Boolean)
            .join(", ");

          const place = await searchPlaceInBrowser(query, bias ?? undefined);
          if (!place) return null;
          return { activityId: activity.id, ...place };
        });

        const updates = found.filter(
          (u): u is NonNullable<typeof u> => u != null
        );

        if (cancelled || !updates.length) return;

        const updated = await api<Itinerary>(`/itinerary/${itinerary.id}/enrich-places`, {
          method: "PATCH",
          body: JSON.stringify({ updates }),
        });

        onUpdatedRef.current?.(updated);
      } catch (e) {
        console.warn("Place enrichment failed:", e);
        ranForId.current = null;
      } finally {
        if (!cancelled) setEnriching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, loadError, itinerary?.id, itinerary?.days]);

  return { enriching, mapsError: loadError };
}
