import { env } from "../config/env.js";

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";

export type PlaceEnrichment = {
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  placeId?: string;
  formattedAddress?: string;
};

type GeocodeResult = { lat: number; lng: number } | null;

const cache = new Map<string, PlaceEnrichment | null>();

function mapsKey(): string | null {
  return env.GOOGLE_MAPS_API_KEY?.trim() || null;
}

export function isPlacesEnrichmentEnabled(): boolean {
  return !!mapsKey();
}

/** Slow path: REST Places on server during /generate. Off by default (use browser). */
export function isServerPlacesEnrichmentEnabled(): boolean {
  return !!env.ENABLE_SERVER_PLACES_ENRICHMENT && !!mapsKey();
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google API HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function geocodeDestination(
  destination: string,
  country: string
): Promise<GeocodeResult> {
  const key = mapsKey();
  if (!key) return null;

  const address = [destination, country].filter(Boolean).join(", ");
  const cacheKey = `geo:${address.toLowerCase()}`;
  if (cache.has(cacheKey)) {
    const hit = cache.get(cacheKey);
    return hit?.latitude != null && hit.longitude != null
      ? { lat: hit.latitude, lng: hit.longitude }
      : null;
  }

  try {
    const url = new URL(GEOCODE_URL);
    url.searchParams.set("address", address);
    url.searchParams.set("key", key);

    const data = await fetchJson<{
      status: string;
      results?: { geometry: { location: { lat: number; lng: number } } }[];
    }>(url.toString());

    if (data.status !== "OK" || !data.results?.[0]) {
      cache.set(cacheKey, null);
      return null;
    }

    const { lat, lng } = data.results[0].geometry.location;
    cache.set(cacheKey, { latitude: lat, longitude: lng });
    return { lat, lng };
  } catch (e) {
    console.warn("Geocode failed:", (e as Error).message);
    return null;
  }
}

function photoUrl(photoReference: string, key: string): string {
  const url = new URL("https://maps.googleapis.com/maps/api/place/photo");
  url.searchParams.set("maxwidth", "400");
  url.searchParams.set("photo_reference", photoReference);
  url.searchParams.set("key", key);
  return url.toString();
}

export async function enrichPlace(
  query: string,
  bias?: { lat: number; lng: number }
): Promise<PlaceEnrichment | null> {
  const key = mapsKey();
  if (!key || !query.trim()) return null;

  const cacheKey = `place:${query.toLowerCase()}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey) ?? null;

  try {
    const url = new URL(TEXT_SEARCH_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("key", key);
    if (bias) {
      url.searchParams.set("location", `${bias.lat},${bias.lng}`);
      url.searchParams.set("radius", "25000");
    }

    const data = await fetchJson<{
      status: string;
      results?: {
        place_id: string;
        name: string;
        formatted_address?: string;
        geometry: { location: { lat: number; lng: number } };
        photos?: { photo_reference: string }[];
      }[];
    }>(url.toString());

    if (data.status !== "OK" || !data.results?.length) {
      cache.set(cacheKey, null);
      return null;
    }

    const place = data.results[0];
    const enrichment: PlaceEnrichment = {
      placeId: place.place_id,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      formattedAddress: place.formatted_address ?? place.name,
    };

    const photoRef = place.photos?.[0]?.photo_reference;
    if (photoRef) {
      enrichment.imageUrl = photoUrl(photoRef, key);
    }

    cache.set(cacheKey, enrichment);
    return enrichment;
  } catch (e) {
    console.warn(`Place search failed for "${query.slice(0, 60)}":`, (e as Error).message);
    cache.set(cacheKey, null);
    return null;
  }
}

export type ActivityForEnrichment = {
  title: string;
  location?: string;
  description?: string;
};

export async function enrichActivity(
  activity: ActivityForEnrichment,
  destination: string,
  country: string,
  bias?: { lat: number; lng: number }
): Promise<PlaceEnrichment | null> {
  const parts = [activity.title, activity.location, destination, country].filter(Boolean);
  const query = parts.join(", ");
  return enrichPlace(query, bias);
}

const PLACES_CONCURRENCY = 4;

async function runPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }
  const workers = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}

/** Enrich all activities with Google Places (photos + coordinates). */
export async function enrichItineraryActivities<
  T extends ActivityForEnrichment & Record<string, unknown>,
>(activities: T[], destination: string, country: string): Promise<(T & PlaceEnrichment)[]> {
  if (!isServerPlacesEnrichmentEnabled()) {
    return activities as (T & PlaceEnrichment)[];
  }

  const center = await geocodeDestination(destination, country);
  const bias = center ? { lat: center.lat, lng: center.lng } : undefined;

  return runPool(activities, PLACES_CONCURRENCY, async (activity) => {
    const place = await enrichActivity(activity, destination, country, bias);
    return {
      ...activity,
      ...(place ?? {}),
      location: place?.formattedAddress ?? activity.location,
    } as T & PlaceEnrichment;
  });
}
