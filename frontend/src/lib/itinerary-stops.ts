import type { Itinerary, ItineraryDay } from "@/types";
import type { LatLng } from "@/lib/city-coords";

export type MapStop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
  time?: string;
  imageUrl?: string | null;
};

function parseTime(t?: string | null): number {
  if (!t) return 9999;
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return 9999;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
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

/** Map stops with real Google Places coordinates only (accurate routing). */
export function mapStopsFromActivities(
  activities: {
    id: string;
    title: string;
    time?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    imageUrl?: string | null;
  }[]
): MapStop[] {
  const geocoded = activities.filter(
    (a) =>
      a.latitude != null &&
      a.longitude != null &&
      Number.isFinite(a.latitude) &&
      Number.isFinite(a.longitude)
  );

  return geocoded.map((a, i) => ({
    id: a.id,
    name: a.title,
    lat: a.latitude as number,
    lng: a.longitude as number,
    order: i + 1,
    time: a.time ?? undefined,
    imageUrl: a.imageUrl ?? undefined,
  }));
}

export function hasEnoughStopsForRoute(stops: MapStop[]): boolean {
  return stops.length >= 2;
}
