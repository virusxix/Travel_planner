"use client";

import { useEffect, useState } from "react";
import { DEFAULT_MAP_CENTER, lookupCityCenter, type LatLng } from "@/lib/city-coords";
import { useGoogleMaps } from "@/components/maps/google-maps-provider";
import { geocodeInBrowser } from "@/lib/places-search";

/**
 * Map center from destination — static lookup, then Maps JS Geocoder (not REST Geocoding API).
 */
export function useGeocodedCenter(destination: string, country: string): LatLng {
  const { isLoaded } = useGoogleMaps();
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

    if (!isLoaded) return;

    const query = ctry ? `${dest}, ${ctry}` : dest;
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      const loc = await geocodeInBrowser(query);
      if (!cancelled && loc) setCenter({ lat: loc.lat, lng: loc.lng });
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [destination, country, isLoaded]);

  return center;
}
