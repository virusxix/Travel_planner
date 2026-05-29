"use client";

import { useEffect, useState } from "react";
import { DEFAULT_MAP_CENTER, lookupCityCenter, type LatLng } from "@/lib/city-coords";

/**
 * Resolves map center from destination + country.
 * Uses static lookup first, then Google Geocoding API (debounced) for any city.
 */
export function useGeocodedCenter(destination: string, country: string): LatLng {
  const [center, setCenter] = useState<LatLng>(() => {
    return lookupCityCenter(destination, country) ?? DEFAULT_MAP_CENTER;
  });

  useEffect(() => {
    const known = lookupCityCenter(destination, country);
    if (known) {
      setCenter(known);
      return;
    }

    const dest = destination.trim();
    const ctry = country.trim();
    if (!dest && !ctry) {
      setCenter(DEFAULT_MAP_CENTER);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
    if (!apiKey) {
      setCenter(DEFAULT_MAP_CENTER);
      return;
    }

    const query = ctry ? `${dest}, ${ctry}` : dest;
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
        url.searchParams.set("address", query);
        url.searchParams.set("key", apiKey);

        const res = await fetch(url.toString(), { signal: controller.signal });
        const data = (await res.json()) as {
          status: string;
          results?: { geometry: { location: { lat: number; lng: number } } }[];
        };

        if (data.status === "OK" && data.results?.[0]) {
          const { lat, lng } = data.results[0].geometry.location;
          setCenter({ lat, lng });
        }
      } catch {
        /* ignore abort / network */
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [destination, country]);

  return center;
}
