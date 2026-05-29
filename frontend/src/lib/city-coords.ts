export type LatLng = { lat: number; lng: number };

/** Known city centers — instant map positioning without geocoding. */
const CITY_MAP: Record<string, LatLng> = {
  "chiang mai,thailand": { lat: 18.7883, lng: 98.9853 },
  "bangkok,thailand": { lat: 13.7563, lng: 100.5018 },
  "mandalay,myanmar": { lat: 21.9588, lng: 96.0891 },
  "yangon,myanmar": { lat: 16.8409, lng: 96.1735 },
  "bagan,myanmar": { lat: 21.1717, lng: 94.8585 },
  "rome,italy": { lat: 41.9028, lng: 12.4964 },
  "paris,france": { lat: 48.8566, lng: 2.3522 },
  "tokyo,japan": { lat: 35.6762, lng: 139.6503 },
  "bali,indonesia": { lat: -8.4095, lng: 115.1889 },
  "singapore,singapore": { lat: 1.3521, lng: 103.8198 },
  mandalay: { lat: 21.9588, lng: 96.0891 },
  myanmar: { lat: 21.9588, lng: 96.0891 },
};

export const DEFAULT_MAP_CENTER: LatLng = { lat: 18.7883, lng: 98.9853 };

export function lookupCityCenter(destination: string, country: string): LatLng | null {
  const dest = destination.trim().toLowerCase();
  const ctry = country.trim().toLowerCase();
  if (!dest && !ctry) return null;

  const combined = `${dest},${ctry}`;
  return CITY_MAP[combined] ?? CITY_MAP[dest] ?? CITY_MAP[ctry] ?? null;
}

/** @deprecated Use lookupCityCenter + geocoding hook for unknown cities */
export function getCityCenter(destination: string, country: string): LatLng {
  return lookupCityCenter(destination, country) ?? DEFAULT_MAP_CENTER;
}

/** @deprecated Use mapStopsFromActivities in lib/itinerary-stops.ts */
export function activityMarkersFromItinerary(
  center: LatLng,
  activities: {
    id: string;
    title: string;
    location?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }[]
) {
  void center;
  return activities
    .filter(
      (a) =>
        a.latitude != null &&
        a.longitude != null &&
        Number.isFinite(a.latitude) &&
        Number.isFinite(a.longitude)
    )
    .map((a, i) => ({
      id: a.id,
      name: a.title,
      lat: a.latitude as number,
      lng: a.longitude as number,
      order: i + 1,
    }));
}
