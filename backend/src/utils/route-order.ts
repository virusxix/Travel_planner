/** Reorder day activities so the visit sequence minimizes backtracking on the map. */

export type GeoPoint = { lat: number; lng: number };

export type RoutableActivity = {
  time?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

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

export function parseTimeMinutes(t?: string | null): number {
  if (!t) return 9999;
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return 9999;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
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

function timeBucket(minutes: number): "morning" | "afternoon" | "evening" | "any" {
  if (minutes >= 9999) return "any";
  const h = Math.floor(minutes / 60);
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function optimizeGeoOrder(points: GeoPoint[], routeStart: GeoPoint): number[] {
  if (points.length < 2) return points.map((_, i) => i);

  const startIndex = points.reduce((best, p, i) => {
    const d = haversineKm(routeStart, p);
    const bestD = haversineKm(routeStart, points[best]);
    return d < bestD ? i : best;
  }, 0);

  return twoOptIndices(nearestNeighborIndices(points, startIndex), points);
}

function hasCoords(a: RoutableActivity): a is RoutableActivity & { latitude: number; longitude: number } {
  return (
    a.latitude != null &&
    a.longitude != null &&
    Number.isFinite(a.latitude) &&
    Number.isFinite(a.longitude)
  );
}

/**
 * Reorder activities so consecutive map stops are geographically close.
 * Keeps morning / afternoon / evening time slots — only shuffles within each bucket.
 */
export function reorderActivitiesForRoute<T extends RoutableActivity>(
  activities: T[],
  routeStart: GeoPoint
): T[] {
  if (activities.length < 2) return activities;

  const sorted = [...activities].sort(
    (a, b) => parseTimeMinutes(a.time) - parseTimeMinutes(b.time)
  );

  const buckets: Record<string, T[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    any: [],
  };

  for (const act of sorted) {
    buckets[timeBucket(parseTimeMinutes(act.time))].push(act);
  }

  const bucketOrder = ["morning", "afternoon", "evening", "any"] as const;
  const reordered: T[] = [];
  let cursor = routeStart;

  for (const key of bucketOrder) {
    const group = buckets[key];
    if (!group.length) continue;

    const mappable = group.filter(hasCoords);
    const unmappable = group.filter((a) => !hasCoords(a));

    if (mappable.length >= 2) {
      const points = mappable.map((a) => ({ lat: a.latitude, lng: a.longitude }));
      const order = optimizeGeoOrder(points, cursor);
      const ordered = order.map((i) => mappable[i]);
      reordered.push(...ordered, ...unmappable);
      const last = ordered[ordered.length - 1];
      if (last && hasCoords(last)) {
        cursor = { lat: last.latitude, lng: last.longitude };
      }
    } else {
      reordered.push(...group);
      const last = mappable[mappable.length - 1];
      if (last && hasCoords(last)) {
        cursor = { lat: last.latitude, lng: last.longitude };
      }
    }
  }

  const timeSlots = sorted.map((a) => a.time);
  return reordered.map((act, i) => ({
    ...act,
    time: timeSlots[i] ?? act.time,
  }));
}

/** Sum of leg distances for a sequence — quick sanity metric */
export function totalRouteKm(
  activities: RoutableActivity[],
  routeStart: GeoPoint
): number {
  const withCoords = activities.filter(hasCoords);
  if (!withCoords.length) return 0;

  let total = 0;
  let prev: GeoPoint = routeStart;
  for (const a of withCoords) {
    const next = { lat: a.latitude, lng: a.longitude };
    total += haversineKm(prev, next);
    prev = next;
  }
  return total;
}
