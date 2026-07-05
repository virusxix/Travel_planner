import { env } from "../config/env.js";
import { decodePolyline } from "../utils/polyline.js";

const ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

export type RouteStop = { lat: number; lng: number; name?: string };

export type RouteLeg = { instruction: string; distance?: string; duration?: string };

export type StreetRouteResponse = {
  path: { lat: number; lng: number }[];
  steps: RouteLeg[];
  duration: string | null;
  distance: string | null;
};

function mapsKey(): string | null {
  return env.GOOGLE_MAPS_API_KEY?.trim() || null;
}

function travelMode(mode: string): string {
  switch (mode) {
    case "walk":
      return "WALK";
    case "bike":
      return "BICYCLE";
    case "bus":
    case "train":
      return "TRANSIT";
    default:
      return "DRIVE";
  }
}

function formatDuration(iso?: string | null): string | null {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return iso;
  const h = parseInt(m[1] ?? "0", 10);
  const min = parseInt(m[2] ?? "0", 10);
  if (h > 0) return min > 0 ? `${h} hr ${min} min` : `${h} hr`;
  return `${Math.max(1, min)} min`;
}

function formatMeters(m?: number | null): string | null {
  if (m == null || !Number.isFinite(m)) return null;
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

function latLng(stop: RouteStop) {
  return { latitude: stop.lat, longitude: stop.lng };
}

async function callRoutesApi(
  stops: RouteStop[],
  mode: string
): Promise<StreetRouteResponse | null> {
  const key = mapsKey();
  if (!key || stops.length < 2) return null;

  try {
    return await fetchRoutesApi(stops, mode, key);
  } catch (e) {
    console.warn("Routes API call failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

async function fetchRoutesApi(
  stops: RouteStop[],
  mode: string,
  key: string
): Promise<StreetRouteResponse> {
  const body = {
    origin: { location: { latLng: latLng(stops[0]) } },
    destination: { location: { latLng: latLng(stops[stops.length - 1]) } },
    ...(stops.length > 2
      ? {
          intermediates: stops.slice(1, -1).map((s) => ({
            location: { latLng: latLng(s) },
          })),
        }
      : {}),
    travelMode: travelMode(mode),
    routingPreference: "TRAFFIC_UNAWARE",
  };

  const res = await fetch(ROUTES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "routes.polyline.encodedPolyline,routes.distanceMeters,routes.duration,routes.legs.distanceMeters,routes.legs.duration",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.warn("Routes API error:", res.status, err.slice(0, 300));
    throw new Error(`Routes API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    routes?: {
      polyline?: { encodedPolyline?: string };
      distanceMeters?: number;
      duration?: string;
      legs?: { distanceMeters?: number; duration?: string }[];
    }[];
  };

  const route = data.routes?.[0];
  const encoded = route?.polyline?.encodedPolyline;
  if (!encoded) throw new Error("Routes API returned no polyline");

  const path = decodePolyline(encoded);
  if (path.length < 2) throw new Error("Routes API returned empty path");

  const steps: RouteLeg[] = [];
  if (stops[0]?.name) steps.push({ instruction: `Start at ${stops[0].name}` });

  const legs = route.legs ?? [];
  if (legs.length) {
    legs.forEach((leg, i) => {
      steps.push({
        instruction: `${stops[i]?.name ?? `Stop ${i + 1}`} → ${stops[i + 1]?.name ?? `Stop ${i + 2}`}`,
        distance: formatMeters(leg.distanceMeters) ?? undefined,
        duration: formatDuration(leg.duration) ?? undefined,
      });
    });
  }

  return {
    path,
    steps,
    duration: formatDuration(route.duration),
    distance: formatMeters(route.distanceMeters),
  };
}

async function callRoutesApiLegs(
  stops: RouteStop[],
  mode: string
): Promise<StreetRouteResponse | null> {
  const path: { lat: number; lng: number }[] = [];
  const steps: RouteLeg[] = [];

  if (stops[0]?.name) steps.push({ instruction: `Start at ${stops[0].name}` });

  for (let i = 0; i < stops.length - 1; i++) {
    const leg = await callRoutesApi([stops[i], stops[i + 1]], mode);
    if (!leg?.path.length) return null;

    if (path.length) leg.path.shift();
    path.push(...leg.path);

    const legStep = leg.steps.find((s) => s.instruction.includes("→"));
    steps.push({
      instruction: `${stops[i].name ?? `Stop ${i + 1}`} → ${stops[i + 1].name ?? `Stop ${i + 2}`}`,
      distance: legStep?.distance,
      duration: legStep?.duration,
    });
  }

  let totalM = 0;
  for (const s of steps) {
    if (s.distance?.includes("km")) totalM += parseFloat(s.distance) * 1000;
    else if (s.distance) totalM += parseInt(s.distance, 10) || 0;
  }

  return {
    path,
    steps,
    duration: null,
    distance: formatMeters(totalM),
  };
}

export async function computeStreetRouteServer(
  stops: RouteStop[],
  mode = "car"
): Promise<StreetRouteResponse> {
  if (!mapsKey()) {
    throw new Error("GOOGLE_MAPS_API_KEY not set on backend");
  }

  const multi = await callRoutesApi(stops, mode);
  if (multi) return multi;

  const legs = await callRoutesApiLegs(stops, mode);
  if (legs) return legs;

  throw new Error(
    "Routes API failed — enable Routes API in Google Cloud and set GOOGLE_MAPS_API_KEY in backend/.env"
  );
}
