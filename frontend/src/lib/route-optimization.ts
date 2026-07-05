import type { MapStop } from "@/lib/itinerary-stops";

export type GeoPoint = { lat: number; lng: number };

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in km — used for ordering, not driving time */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function reverseSegment<T>(arr: T[], from: number, to: number) {
  while (from < to) {
    const tmp = arr[from];
    arr[from] = arr[to];
    arr[to] = tmp;
    from++;
    to--;
  }
}

/** Greedy nearest-neighbor from a fixed start index (open path, no return leg). */
function nearestNeighborIndices(stops: GeoPoint[], startIndex: number): number[] {
  const n = stops.length;
  if (n <= 1) return [0];

  const order: number[] = [startIndex];
  const remaining = new Set<number>();
  for (let i = 0; i < n; i++) {
    if (i !== startIndex) remaining.add(i);
  }

  while (remaining.size > 0) {
    const last = order[order.length - 1];
    let nearest = -1;
    let nearestKm = Infinity;

    for (const i of remaining) {
      const d = haversineKm(stops[last], stops[i]);
      if (d < nearestKm) {
        nearestKm = d;
        nearest = i;
      }
    }

    if (nearest < 0) break;
    order.push(nearest);
    remaining.delete(nearest);
  }

  return order;
}

/** 2-opt on index order for an open path (fewer crossings / less backtracking). */
function twoOptIndices(order: number[], stops: GeoPoint[]): number[] {
  if (order.length < 4) return order;

  const route = [...order];
  let improved = true;
  let guard = 0;

  while (improved && guard < 80) {
    improved = false;
    guard++;

    for (let i = 0; i < route.length - 2; i++) {
      for (let j = i + 2; j < route.length; j++) {
        const a = stops[route[i]];
        const b = stops[route[i + 1]];
        const c = stops[route[j - 1]];
        const d = stops[route[j]];

        const before = haversineKm(a, b) + haversineKm(c, d);
        const after = haversineKm(a, c) + haversineKm(b, d);

        if (after + 1e-9 < before) {
          reverseSegment(route, i + 1, j - 1);
          improved = true;
        }
      }
    }
  }

  return route;
}

/**
 * Reorder geocoded day stops to minimize backtracking on the map.
 * Keeps the first scheduled activity (by time) as the route start, then
 * visits remaining stops via nearest-neighbor + 2-opt polish.
 */
export function optimizeMapStopOrder(stops: MapStop[]): MapStop[] {
  if (stops.length < 3) {
    return stops.map((s, i) => ({ ...s, order: i + 1 }));
  }

  const geo: GeoPoint[] = stops.map((s) => ({ lat: s.lat, lng: s.lng }));
  const order = twoOptIndices(nearestNeighborIndices(geo, 0), geo);

  return order.map((idx, i) => ({ ...stops[idx], order: i + 1 }));
}
