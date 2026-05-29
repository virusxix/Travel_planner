"use client";

import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "@/components/maps/google-maps-provider";
import { buildTeravueCurvedPath, type LatLngPoint } from "@/lib/curved-route-path";

export type RouteStop = { lat: number; lng: number; name?: string };

export type TravelMode = "walk" | "bike" | "car" | "bus" | "train";

export type RoadDirectionStep = {
  instruction: string;
  distance?: string;
  duration?: string;
};

/** Brand gradient route — visible on Google default dark map */
const ROUTE_STROKE = "#ec4899";
const ROUTE_GLOW = "#8b5cf6";

const SPEED_KMH: Record<TravelMode, number> = {
  walk: 5,
  bike: 15,
  car: 35,
  bus: 25,
  train: 45,
};

function pathFromStops(stops: RouteStop[]) {
  return stops.map((s) => ({ lat: s.lat, lng: s.lng }));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineKm(a: LatLngPoint, b: LatLngPoint): number {
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

function formatDurationRange(minutes: number): string {
  const low = Math.max(1, Math.round(minutes * 0.88));
  const high = Math.max(low + 1, Math.round(minutes * 1.12));
  if (high >= 60) {
    const h1 = Math.floor(low / 60);
    const h2 = Math.floor(high / 60);
    return `${h1}–${h2} hr`;
  }
  return `${low}–${high} min`;
}

function formatDistanceKm(km: number): string {
  if (km >= 1) return `${km.toFixed(1)} km`;
  return `${Math.round(km * 1000)} m`;
}

function estimateRoute(stops: RouteStop[], travelMode: TravelMode) {
  let totalKm = 0;
  const steps: RoadDirectionStep[] = [];

  for (let i = 0; i < stops.length; i++) {
    if (i > 0) {
      const legKm = haversineKm(stops[i - 1], stops[i]);
      totalKm += legKm;
      const legMin = (legKm / SPEED_KMH[travelMode]) * 60;
      steps.push({
        instruction: `${stops[i - 1].name ?? `Stop ${i}`} → ${stops[i].name ?? `Stop ${i + 1}`}`,
        distance: formatDistanceKm(legKm),
        duration: formatDurationRange(legMin),
      });
    } else if (stops[i].name) {
      steps.push({ instruction: `Start at ${stops[i].name}` });
    }
  }

  const totalMin = (totalKm / SPEED_KMH[travelMode]) * 60;

  return {
    path: buildTeravueCurvedPath(stops),
    steps,
    duration: formatDurationRange(totalMin),
    distance: formatDistanceKm(totalKm),
    ok: true as const,
  };
}

function clearPolylines(polylines: google.maps.Polyline[]) {
  polylines.forEach((p) => p.setMap(null));
}

/** Thick glowing blue curve (TERAVUE / Dribbble style) */
function drawTeravueRoute(map: google.maps.Map, path: LatLngPoint[]): google.maps.Polyline[] {
  if (path.length < 2) return [];

  const glow = new google.maps.Polyline({
    path,
    strokeColor: ROUTE_GLOW,
    strokeOpacity: 0.45,
    strokeWeight: 11,
    geodesic: false,
    map,
    zIndex: 1,
  });

  const line = new google.maps.Polyline({
    path,
    strokeColor: ROUTE_STROKE,
    strokeOpacity: 1,
    strokeWeight: 5,
    geodesic: false,
    map,
    zIndex: 2,
  });

  return [glow, line];
}

export function useItineraryRoute(
  stops: RouteStop[],
  travelMode: TravelMode,
  map: google.maps.Map | null
) {
  const { isLoaded, loadError } = useGoogleMaps();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const [path, setPath] = useState<RouteStop[]>(() => pathFromStops(stops));
  const [steps, setSteps] = useState<RoadDirectionStep[]>([]);
  const [duration, setDuration] = useState<string | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const stopKey = stops.map((s) => `${s.lat.toFixed(6)},${s.lng.toFixed(6)}`).join("|");

  useEffect(() => {
    clearPolylines(polylinesRef.current);
    polylinesRef.current = [];
    setPath(pathFromStops(stops));
    setSteps([]);
    setDuration(null);
    setDistance(null);
    setRouteReady(false);
    setRouteError(null);

    if (loadError || !isLoaded || !map || stops.length < 2) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const result = estimateRoute(stops, travelMode);
    const drawn = drawTeravueRoute(map, result.path);
    polylinesRef.current = drawn;

    setPath(result.path);
    setSteps(result.steps);
    setDuration(result.duration);
    setDistance(result.distance);
    setRouteReady(drawn.length > 0);

    if (stops.length >= 2) {
      const bounds = new google.maps.LatLngBounds();
      stops.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, 64);
    }

    setLoading(false);

    return () => {
      clearPolylines(polylinesRef.current);
      polylinesRef.current = [];
    };
  }, [isLoaded, loadError, travelMode, stopKey, map]);

  return { path, steps, duration, distance, loading, routeReady, routeError };
}
