import type { LatLngPoint } from "@/lib/curved-route-path";
import { api } from "@/lib/api";

export type StreetRouteStop = { lat: number; lng: number; name?: string };

export type StreetRouteLeg = {
  instruction: string;
  distance?: string;
  duration?: string;
};

export type StreetRouteResult = {
  path: LatLngPoint[];
  steps: StreetRouteLeg[];
  duration: string | null;
  distance: string | null;
  ok: boolean;
  error?: string;
};

export type StreetTravelMode = "walk" | "bike" | "car" | "bus" | "train";

type RoutesLib = google.maps.RoutesLibrary & {
  Route?: {
    computeRoutes(
      request: google.maps.routes.ComputeRoutesRequest
    ): Promise<{ routes?: google.maps.routes.Route[] }>;
  };
};

function toGoogleTravelMode(mode: StreetTravelMode): google.maps.TravelMode {
  switch (mode) {
    case "walk":
      return google.maps.TravelMode.WALKING;
    case "bike":
      return google.maps.TravelMode.BICYCLING;
    case "bus":
    case "train":
      return google.maps.TravelMode.TRANSIT;
    default:
      return google.maps.TravelMode.DRIVING;
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case "REQUEST_DENIED":
      return "Route API denied — enable Routes API (and Maps JavaScript API) in Google Cloud, turn on billing, and allow your localhost referrer on the API key.";
    case "OVER_QUERY_LIMIT":
      return "Google Maps route quota exceeded. Try again later.";
    case "ZERO_RESULTS":
      return "No driving route found between these stops.";
    case "NOT_FOUND":
      return "One or more stops could not be located on the map.";
    case "INVALID_REQUEST":
      return "Invalid route request. Check that stops have valid coordinates.";
    default:
      return status || "Route request failed";
  }
}

function formatSeconds(sec?: number | null): string | null {
  if (sec == null || !Number.isFinite(sec)) return null;
  const min = Math.max(1, Math.round(sec / 60));
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
  }
  return `${min} min`;
}

function formatMillis(ms?: number | null): string | null {
  if (ms == null || !Number.isFinite(ms)) return null;
  return formatSeconds(ms / 1000);
}

function formatMeters(m?: number | null): string | null {
  if (m == null || !Number.isFinite(m)) return null;
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

function latLngFromGoogle(p: google.maps.LatLng): LatLngPoint {
  return { lat: p.lat(), lng: p.lng() };
}

function pointToLatLng(
  p: google.maps.LatLng | google.maps.LatLngLiteral | google.maps.LatLngAltitude
): LatLngPoint {
  if (typeof (p as google.maps.LatLng).lat === "function") {
    return latLngFromGoogle(p as google.maps.LatLng);
  }
  const lit = p as google.maps.LatLngLiteral;
  return { lat: lit.lat, lng: lit.lng };
}

function appendPath(path: LatLngPoint[], legPath: LatLngPoint[]) {
  if (!legPath.length) return;
  if (path.length) legPath.shift();
  path.push(...legPath);
}

async function loadRoutesLib(): Promise<RoutesLib> {
  return google.maps.importLibrary("routes") as Promise<RoutesLib>;
}

async function ensureGeometryEncoding(): Promise<boolean> {
  if (google.maps.geometry?.encoding) return true;
  try {
    await google.maps.importLibrary("geometry");
    return !!google.maps.geometry?.encoding;
  } catch {
    return false;
  }
}

function pathFromEncodedPolyline(
  polyline: string | google.maps.DirectionsPolyline | undefined
): LatLngPoint[] {
  if (!polyline) return [];
  const encoded =
    typeof polyline === "string" ? polyline : polyline.points ?? "";
  if (!encoded || !google.maps.geometry?.encoding) return [];
  return google.maps.geometry.encoding.decodePath(encoded).map(latLngFromGoogle);
}

function pathFromDirectionsResult(result: google.maps.DirectionsResult): LatLngPoint[] {
  const route = result.routes[0];
  if (!route) return [];

  if (route.overview_path?.length) {
    return route.overview_path.map(latLngFromGoogle);
  }

  const fromPolyline = pathFromEncodedPolyline(route.overview_polyline);
  if (fromPolyline.length) return fromPolyline;

  const path: LatLngPoint[] = [];
  for (const leg of route.legs ?? []) {
    for (const step of leg.steps ?? []) {
      for (const p of step.path ?? []) {
        const point = latLngFromGoogle(p);
        const last = path[path.length - 1];
        if (!last || last.lat !== point.lat || last.lng !== point.lng) {
          path.push(point);
        }
      }
    }
  }
  return path;
}

function stepsFromStops(stops: StreetRouteStop[], legs?: StreetRouteLeg[]): StreetRouteLeg[] {
  const steps: StreetRouteLeg[] = [];
  if (stops[0]?.name) steps.push({ instruction: `Start at ${stops[0].name}` });

  if (legs?.length) return [...steps, ...legs];

  for (let i = 0; i < stops.length - 1; i++) {
    steps.push({
      instruction: `${stops[i].name ?? `Stop ${i + 1}`} → ${stops[i + 1].name ?? `Stop ${i + 2}`}`,
    });
  }
  return steps;
}

async function computeViaRoutesApi(
  lib: RoutesLib,
  stops: StreetRouteStop[],
  travelMode: google.maps.TravelMode
): Promise<StreetRouteResult | null> {
  if (!lib.Route?.computeRoutes) return null;

  const origin = stops[0];
  const destination = stops[stops.length - 1];
  const intermediates = stops.slice(1, -1).map((s) => ({ lat: s.lat, lng: s.lng }));

  const { routes } = await lib.Route.computeRoutes({
    origin: { lat: origin.lat, lng: origin.lng },
    destination: { lat: destination.lat, lng: destination.lng },
    ...(intermediates.length ? { intermediates } : {}),
    travelMode,
    fields: ["path", "durationMillis", "distanceMeters", "legs", "localizedValues"],
  });

  const route = routes?.[0];
  if (!route?.path?.length) return null;

  const path = route.path.map(pointToLatLng);
  const legSteps =
    route.legs?.map((leg, i) => ({
      instruction: `${stops[i]?.name ?? `Stop ${i + 1}`} → ${stops[i + 1]?.name ?? `Stop ${i + 2}`}`,
      distance: leg.localizedValues?.distance?.text ?? formatMeters(leg.distanceMeters) ?? undefined,
      duration:
        leg.localizedValues?.duration?.text ??
        formatMillis(leg.durationMillis ?? leg.staticDurationMillis) ??
        undefined,
    })) ?? [];

  return {
    path,
    steps: stepsFromStops(stops, legSteps),
    duration:
      route.localizedValues?.duration?.text ??
      formatMillis(route.durationMillis ?? route.staticDurationMillis),
    distance: route.localizedValues?.distance?.text ?? formatMeters(route.distanceMeters),
    ok: path.length >= 2,
  };
}

async function computeViaRoutesApiLegs(
  lib: RoutesLib,
  stops: StreetRouteStop[],
  travelMode: google.maps.TravelMode
): Promise<StreetRouteResult | null> {
  if (!lib.Route?.computeRoutes) return null;

  const path: LatLngPoint[] = [];
  let totalMs = 0;
  let totalM = 0;
  const legSteps: StreetRouteLeg[] = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const { routes } = await lib.Route.computeRoutes({
      origin: { lat: stops[i].lat, lng: stops[i].lng },
      destination: { lat: stops[i + 1].lat, lng: stops[i + 1].lng },
      travelMode,
      fields: ["path", "durationMillis", "distanceMeters", "localizedValues"],
    });

    const route = routes?.[0];
    if (!route?.path?.length) return null;

    appendPath(path, route.path.map(pointToLatLng));
    totalMs += route.durationMillis ?? route.staticDurationMillis ?? 0;
    totalM += route.distanceMeters ?? 0;

    legSteps.push({
      instruction: `${stops[i].name ?? `Stop ${i + 1}`} → ${stops[i + 1].name ?? `Stop ${i + 2}`}`,
      distance: route.localizedValues?.distance?.text ?? formatMeters(route.distanceMeters) ?? undefined,
      duration:
        route.localizedValues?.duration?.text ??
        formatMillis(route.durationMillis ?? route.staticDurationMillis) ??
        undefined,
    });
  }

  return {
    path,
    steps: stepsFromStops(stops, legSteps),
    duration: formatMillis(totalMs),
    distance: formatMeters(totalM),
    ok: path.length >= 2,
  };
}

function directionsRoute(
  service: google.maps.DirectionsService,
  request: google.maps.DirectionsRequest
): Promise<google.maps.DirectionsResult> {
  return new Promise((resolve, reject) => {
    service.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        resolve(result);
        return;
      }
      reject(new Error(formatStatus(status ?? "UNKNOWN")));
    });
  });
}

async function computeViaDirectionsLegacy(
  lib: RoutesLib,
  stops: StreetRouteStop[],
  travelMode: google.maps.TravelMode
): Promise<StreetRouteResult> {
  const ServiceCtor = lib.DirectionsService ?? google.maps.DirectionsService;
  const service = new ServiceCtor();

  const origin = stops[0];
  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(1, -1).map((s) => ({
    location: { lat: s.lat, lng: s.lng },
    stopover: true,
  }));

  try {
    const result = await directionsRoute(service, {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      waypoints: waypoints.length ? waypoints : undefined,
      travelMode,
      optimizeWaypoints: false,
    });

    const path = pathFromDirectionsResult(result);
    if (path.length < 2) {
      throw new Error("Empty route path");
    }

    let sec = 0;
    let meters = 0;
    const legSteps: StreetRouteLeg[] = [];
    for (const leg of result.routes[0]?.legs ?? []) {
      sec += leg.duration?.value ?? 0;
      meters += leg.distance?.value ?? 0;
    }
    result.routes[0]?.legs?.forEach((leg, i) => {
      legSteps.push({
        instruction: `${stops[i]?.name ?? `Stop ${i + 1}`} → ${stops[i + 1]?.name ?? `Stop ${i + 2}`}`,
        distance: leg.distance?.text,
        duration: leg.duration?.text,
      });
    });

    return {
      path,
      steps: stepsFromStops(stops, legSteps),
      duration: formatSeconds(sec),
      distance: formatMeters(meters),
      ok: true,
    };
  } catch {
    const path: LatLngPoint[] = [];
    let totalSec = 0;
    let totalMeters = 0;
    const legSteps: StreetRouteLeg[] = [];

    for (let i = 0; i < stops.length - 1; i++) {
      const legResult = await directionsRoute(service, {
        origin: { lat: stops[i].lat, lng: stops[i].lng },
        destination: { lat: stops[i + 1].lat, lng: stops[i + 1].lng },
        travelMode,
      });

      const legPath = pathFromDirectionsResult(legResult);
      if (!legPath.length) {
        throw new Error("Could not find a route between stops");
      }

      appendPath(path, legPath);
      const leg = legResult.routes[0]?.legs?.[0];
      totalSec += leg?.duration?.value ?? 0;
      totalMeters += leg?.distance?.value ?? 0;
      legSteps.push({
        instruction: `${stops[i].name ?? `Stop ${i + 1}`} → ${stops[i + 1].name ?? `Stop ${i + 2}`}`,
        distance: leg?.distance?.text,
        duration: leg?.duration?.text,
      });
    }

    return {
      path,
      steps: stepsFromStops(stops, legSteps),
      duration: formatSeconds(totalSec),
      distance: formatMeters(totalMeters),
      ok: path.length >= 2,
    };
  }
}

/** Server Routes API — reliable when browser Directions/Routes key is restricted */
async function computeViaBackend(
  stops: StreetRouteStop[],
  travelMode: StreetTravelMode
): Promise<StreetRouteResult | null> {
  try {
    const data = await api<{
      path: LatLngPoint[];
      steps: StreetRouteLeg[];
      duration: string | null;
      distance: string | null;
    }>("/maps/route", {
      method: "POST",
      body: JSON.stringify({ stops, travelMode }),
    });
    if (!data.path?.length || data.path.length < 2) return null;
    return { ...data, ok: true };
  } catch (e) {
    console.warn("Backend route failed:", e);
    return null;
  }
}

/** Road-snapped path — client Routes API, backend Routes API, then Directions fallback. */
export async function computeStreetRoute(
  stops: StreetRouteStop[],
  travelMode: StreetTravelMode
): Promise<StreetRouteResult> {
  if (stops.length < 2) {
    return { path: [], steps: [], duration: null, distance: null, ok: false };
  }

  const viaBackend = await computeViaBackend(stops, travelMode);
  if (viaBackend?.ok) return viaBackend;

  if (typeof google === "undefined" || !google.maps?.importLibrary) {
    return {
      path: [],
      steps: [],
      duration: null,
      distance: null,
      ok: false,
      error: "Route unavailable — set GOOGLE_MAPS_API_KEY in backend/.env and enable Routes API",
    };
  }

  const mode = toGoogleTravelMode(travelMode);

  try {
    await ensureGeometryEncoding();
    const lib = await loadRoutesLib();

    try {
      const viaRoutes = await computeViaRoutesApi(lib, stops, mode);
      if (viaRoutes?.ok) return viaRoutes;
    } catch (e) {
      console.warn("Routes API (multi-stop) failed:", e);
    }

    try {
      const viaLegs = await computeViaRoutesApiLegs(lib, stops, mode);
      if (viaLegs?.ok) return viaLegs;
    } catch (e) {
      console.warn("Routes API (leg-by-leg) failed:", e);
    }

    const backendRetry = await computeViaBackend(stops, travelMode);
    if (backendRetry?.ok) return backendRetry;

    return await computeViaDirectionsLegacy(lib, stops, mode);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("Street route failed:", msg);

    const backendRetry = await computeViaBackend(stops, travelMode);
    if (backendRetry?.ok) return backendRetry;

    return { path: [], steps: [], duration: null, distance: null, ok: false, error: msg };
  }
}
