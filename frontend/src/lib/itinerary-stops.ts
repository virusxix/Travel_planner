import type { Itinerary, ItineraryDay } from "@/types";
import type { LatLng } from "@/lib/city-coords";
import { haversineKm } from "@/lib/route-optimization";

export type MapStop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
  time?: string;
  imageUrl?: string | null;
};

/** ponytail: coords >80km from trip center are usually wrong city / hallucinated */
const MAX_KM_FROM_CENTER = 80;

function parseTime(t?: string | null): number {
  if (!t) return 9999;
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return 9999;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function coordOk(lat: number, lng: number, center?: LatLng): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (!center) return true;
  return haversineKm(center, { lat, lng }) <= MAX_KM_FROM_CENTER;
}

export function getDayActivities(
  itinerary: Itinerary | null | undefined,
  dayNumber: number
): ItineraryDay["activities"] {
  if (!itinerary?.days?.length) return [];
  const day =
    itinerary.days.find((d) => d.dayNumber === dayNumber) ?? itinerary.days[0];
  const activities = [...(day?.activities ?? [])];
  activities.sort((a, b) => parseTime(a.time) - parseTime(b.time));
  return activities;
}

/** Map stops in schedule order — same sequence as the day timeline and route line. */
export function mapStopsFromActivities(
  activities: {
    id: string;
    title: string;
    time?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    imageUrl?: string | null;
  }[],
  center?: LatLng
): MapStop[] {
  let order = 0;
  const stops: MapStop[] = [];

  for (const a of activities) {
    if (a.latitude == null || a.longitude == null) continue;
    const lat = a.latitude;
    const lng = a.longitude;
    if (!coordOk(lat, lng, center)) continue;

    order += 1;
    stops.push({
      id: a.id,
      name: a.title,
      lat,
      lng,
      order,
      time: a.time ?? undefined,
      imageUrl: a.imageUrl ?? undefined,
    });
  }

  return stops;
}

export function hasEnoughStopsForRoute(stops: MapStop[]): boolean {
  return stops.length >= 2;
}

export function isCoordPlausible(
  lat: number,
  lng: number,
  center: LatLng,
  maxKm = MAX_KM_FROM_CENTER
): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return haversineKm(center, { lat, lng }) <= maxKm;
}
