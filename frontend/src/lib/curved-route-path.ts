export type LatLngPoint = { lat: number; lng: number };

/**
 * Smooth quadratic Bézier leg between two stops (stylized curve, not road-snapped).
 * `bulge` is a fraction of chord length; sign alternates per leg for a flowing path.
 */
export function quadraticBezierLeg(
  start: LatLngPoint,
  end: LatLngPoint,
  bulge: number,
  segments = 40
): LatLngPoint[] {
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;
  const dLat = end.lat - start.lat;
  const dLng = end.lng - start.lng;
  const len = Math.hypot(dLat, dLng) || 1;
  const ctrlLat = midLat + (-dLng / len) * len * bulge;
  const ctrlLng = midLng + (dLat / len) * len * bulge;

  const out: LatLngPoint[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const u = 1 - t;
    out.push({
      lat: u * u * start.lat + 2 * u * t * ctrlLat + t * t * end.lat,
      lng: u * u * start.lng + 2 * u * t * ctrlLng + t * t * end.lng,
    });
  }
  return out;
}

/** Full itinerary path: smooth curved segments between each stop in order */
export function buildTeravueCurvedPath(stops: LatLngPoint[]): LatLngPoint[] {
  if (stops.length < 2) return [...stops];

  const path: LatLngPoint[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const bulge = i % 2 === 0 ? 0.18 : -0.18;
    const leg = quadraticBezierLeg(stops[i], stops[i + 1], bulge, 48);
    if (path.length) path.push(...leg.slice(1));
    else path.push(...leg);
  }
  return path;
}
