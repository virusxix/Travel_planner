"use client";

import { useEffect, useRef, useState } from "react";
import type { Itinerary } from "@/types";
import { api } from "@/lib/api";
import { useGoogleMaps } from "@/components/maps/google-maps-provider";
import {
  buildPlaceQuery,
  geocodeInBrowser,
  searchPlaceInBrowser,
} from "@/lib/places-search";
import { isCoordPlausible } from "@/lib/itinerary-stops";

function parseTimeMinutes(t?: string | null): number {
  if (!t) return 9999;
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return 9999;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function activityNeedsPlace(
  activity: { imageUrl?: string | null; latitude?: number | null; longitude?: number | null },
  bias: google.maps.LatLngLiteral | null
): boolean {
  if (!activity.imageUrl || activity.latitude == null || activity.longitude == null) {
    return true;
  }
  if (!bias) return false;
  return !isCoordPlausible(activity.latitude, activity.longitude, bias);
}

function dayHasMappableCoords(day: { activities?: { latitude?: number | null; longitude?: number | null }[] }) {
  return (day.activities ?? []).some(
    (a) => a.latitude != null && a.longitude != null
  );
}

/** Fill coords via Places (sequential, chained bias) then reorder for a compact route. */
export function useEnrichItineraryPlaces(
  itinerary: Itinerary | null | undefined,
  onUpdated?: (itinerary: Itinerary) => void
) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [enriching, setEnriching] = useState(false);
  const ranForId = useRef<string | null>(null);
  const lastActivitySig = useRef("");
  const onUpdatedRef = useRef(onUpdated);
  onUpdatedRef.current = onUpdated;

  const activitySig =
    itinerary?.days
      ?.flatMap((d) => d.activities?.map((a) => a.id) ?? [])
      .join(",") ?? "";

  useEffect(() => {
    if (activitySig !== lastActivitySig.current) {
      ranForId.current = null;
      lastActivitySig.current = activitySig;
    }

    if (loadError || !isLoaded || !itinerary?.id || !itinerary.days?.length) return;
    if (ranForId.current === itinerary.id) return;

    let cancelled = false;

    (async () => {
      const tripBias = await geocodeInBrowser(
        [itinerary.destination, itinerary.country].filter(Boolean).join(", ")
      );

      const sortedDays = [...(itinerary.days ?? [])].sort(
        (a, b) => a.dayNumber - b.dayNumber
      );

      const updates: {
        activityId: string;
        latitude: number;
        longitude: number;
        imageUrl?: string;
        placeId?: string;
        location?: string;
      }[] = [];

      for (const day of sortedDays) {
        const activities = [...(day.activities ?? [])].sort(
          (a, b) => parseTimeMinutes(a.time) - parseTimeMinutes(b.time)
        );

        let chainBias = tripBias ?? undefined;

        for (const activity of activities) {
          if (
            activity.latitude != null &&
            activity.longitude != null &&
            Number.isFinite(activity.latitude) &&
            Number.isFinite(activity.longitude)
          ) {
            chainBias = { lat: activity.latitude, lng: activity.longitude };
          }

          if (!activityNeedsPlace(activity, tripBias)) continue;

          const query = buildPlaceQuery(
            activity.title,
            activity.location,
            itinerary.destination,
            itinerary.country
          );

          const place = await searchPlaceInBrowser(query, chainBias);
          if (!place) continue;

          updates.push({ activityId: activity.id, ...place });
          chainBias = { lat: place.latitude, lng: place.longitude };
        }
      }

      const needsReorderOnly =
        !updates.length &&
        sortedDays.some(dayHasMappableCoords);

      if (!updates.length && !needsReorderOnly) return;

      ranForId.current = itinerary.id;
      setEnriching(true);

      try {
        const updated = await api<Itinerary>(`/itinerary/${itinerary.id}/enrich-places`, {
          method: "PATCH",
          body: JSON.stringify(
            updates.length
              ? { updates }
              : { updates: [], reorderOnly: true }
          ),
        });

        if (!cancelled) onUpdatedRef.current?.(updated);
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
  }, [isLoaded, loadError, activitySig, itinerary?.id, itinerary?.days, itinerary?.destination, itinerary?.country]);

  return { enriching, mapsError: loadError };
}
