"use client";

import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "@/components/maps/google-maps-provider";
import type { LatLngPoint } from "@/lib/curved-route-path";
import { computeStreetRoute, type StreetTravelMode } from "@/lib/street-route";
import { ROUTE_COLORS } from "@/lib/route-theme";

export type RouteStop = { lat: number; lng: number; name?: string };

export type TravelMode = StreetTravelMode;

export type RoadDirectionStep = {
  instruction: string;
  distance?: string;
  duration?: string;
};

function pathFromStops(stops: RouteStop[]) {
  return stops.map((s) => ({ lat: s.lat, lng: s.lng }));
}

function clearPolylines(polylines: google.maps.Polyline[]) {
  polylines.forEach((p) => p.setMap(null));
}

function drawBrandRoute(map: google.maps.Map, path: LatLngPoint[]): google.maps.Polyline[] {
  if (path.length < 2) return [];

  const glow = new google.maps.Polyline({
    path,
    strokeColor: ROUTE_COLORS.glow,
    strokeOpacity: 0.22,
    strokeWeight: 8,
    geodesic: false,
    map,
    zIndex: 1,
  });

  const outline = new google.maps.Polyline({
    path,
    strokeColor: ROUTE_COLORS.border,
    strokeOpacity: 0.35,
    strokeWeight: 5,
    geodesic: false,
    map,
    zIndex: 2,
  });

  const line = new google.maps.Polyline({
    path,
    strokeColor: ROUTE_COLORS.main,
    strokeOpacity: 0.78,
    strokeWeight: 2.5,
    geodesic: false,
    map,
    zIndex: 3,
  });

  return [glow, outline, line];
}

export function useItineraryRoute(
  stops: RouteStop[],
  travelMode: TravelMode,
  map: google.maps.Map | null
) {
  const { isLoaded, loadError } = useGoogleMaps();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const requestIdRef = useRef(0);
  const [path, setPath] = useState<RouteStop[]>(() => pathFromStops(stops));
  const [steps, setSteps] = useState<RoadDirectionStep[]>([]);
  const [duration, setDuration] = useState<string | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const stopKey = stops.map((s) => `${s.lat.toFixed(6)},${s.lng.toFixed(6)}`).join("|");

  useEffect(() => {
    const requestId = ++requestIdRef.current;

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

    (async () => {
      const result = await computeStreetRoute(stops, travelMode);

      if (requestId !== requestIdRef.current) return;

      if (!result.ok || result.path.length < 2) {
        setRouteError(result.error ?? "Route unavailable");
        setLoading(false);
        return;
      }

      const drawn = drawBrandRoute(map, result.path);
      polylinesRef.current = drawn;

      setPath(result.path);
      setSteps(result.steps);
      setDuration(result.duration);
      setDistance(result.distance);
      setRouteReady(drawn.length > 0);

      const bounds = new google.maps.LatLngBounds();
      result.path.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, 64);

      setLoading(false);
    })().catch((e) => {
      if (requestId !== requestIdRef.current) return;
      setRouteError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    });

    return () => {
      clearPolylines(polylinesRef.current);
      polylinesRef.current = [];
    };
  }, [isLoaded, loadError, travelMode, stopKey, map]);

  return { path, steps, duration, distance, loading, routeReady, routeError };
}
