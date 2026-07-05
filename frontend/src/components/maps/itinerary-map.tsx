"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { Navigation, Plus, Minus } from "lucide-react";
import { useGoogleMaps, formatMapLoadError } from "@/components/maps/google-maps-provider";
import { useItineraryRoute, type TravelMode } from "@/hooks/use-itinerary-route";
import { MapStopMarkers } from "@/components/maps/map-stop-markers";
import { brandedNumberedMarkerIcon } from "@/lib/map-marker-icon";

export interface ItineraryMapStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
  imageUrl?: string | null;
}

const ENV_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim();
/** Custom cloud styles override defaults — only use when user configured a real map ID */
const CLOUD_MAP_ID =
  ENV_MAP_ID && ENV_MAP_ID !== "DEMO_MAP_ID" ? ENV_MAP_ID : undefined;

export function ItineraryMap({
  center,
  stops = [],
}: {
  center: { lat: number; lng: number };
  stops?: ItineraryMapStop[];
  routeDuration?: string;
  routeTip?: string;
  variant?: "explore" | "classic";
}) {
  const { apiKey, isLoaded, loadError } = useGoogleMaps();
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [advancedMarkersOk, setAdvancedMarkersOk] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const travelMode: TravelMode = "car";

  const stopCoords = useMemo(
    () => stops.map((s) => ({ lat: s.lat, lng: s.lng, name: s.name })),
    [stops]
  );

  const { routeReady, loading: routeLoading, duration, distance, routeError } =
    useItineraryRoute(stopCoords, travelMode, mapInstance);

  const mapCenter = useMemo(() => center, [center.lat, center.lng]);

  useEffect(() => {
    if (!isLoaded) return;
    google.maps
      .importLibrary("marker")
      .then(() => setAdvancedMarkersOk(true))
      .catch(() => setAdvancedMarkersOk(false));
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded && mapRef.current && stops.length > 0 && !routeReady && !routeLoading) {
      const bounds = new google.maps.LatLngBounds();
      stops.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
      mapRef.current.fitBounds(bounds, 72);
    } else if (!routeReady && mapRef.current) {
      mapRef.current.panTo(mapCenter);
    }
  }, [isLoaded, stops, routeReady, routeLoading, mapCenter.lat, mapCenter.lng]);

  if (!apiKey) {
    return (
      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600 text-sm text-center px-6">
          Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to frontend/.env.local
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-6">
        <p className="text-red-600 text-sm text-center max-w-md">
          {formatMapLoadError(loadError)}
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="absolute inset-0 bg-slate-200 animate-pulse" />;
  }

  const useAdvanced = advancedMarkersOk && !!mapInstance && !!CLOUD_MAP_ID;

  return (
    <div className="absolute inset-0">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={mapCenter}
        zoom={13}
        onLoad={(map) => {
          mapRef.current = map;
          setMapInstance(map);
        }}
        onUnmount={() => {
          mapRef.current = null;
          setMapInstance(null);
        }}
        options={{
          ...(CLOUD_MAP_ID ? { mapId: CLOUD_MAP_ID } : {}),
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          colorScheme: "DARK",
          backgroundColor: "#0a1622",
          clickableIcons: true,
        }}
      >
        {stops.length === 0 && <Marker position={mapCenter} title="Destination" />}

        {useAdvanced ? (
          <MapStopMarkers map={mapInstance} stops={stops} />
        ) : (
          stops.map((s) => (
            <Marker
              key={s.id}
              position={{ lat: s.lat, lng: s.lng }}
              title={s.name}
              icon={brandedNumberedMarkerIcon(s.order)}
              zIndex={10 + s.order}
            />
          ))
        )}
      </GoogleMap>

      {stops.length >= 2 && (
        <div className="absolute left-3 top-3 z-10 rounded-2xl bg-[#0a1622]/90 backdrop-blur-md border border-white/10 px-3 py-2 shadow-lg text-xs">
          {routeLoading && <p className="text-slate-600">Loading route…</p>}
          {!routeLoading && routeReady && duration && (
            <p className="font-semibold text-slate-900">
              {duration}
              {distance ? <span className="text-slate-500 font-normal"> · {distance}</span> : null}
            </p>
          )}
          {!routeLoading && routeError && (
            <p className="text-red-600 max-w-[200px]">{routeError}</p>
          )}
        </div>
      )}

      {/* Zoom / fit — glass controls matching app UI */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1 rounded-2xl bg-[#0a1622]/80 backdrop-blur-md border border-white/10 p-1 shadow-lg">
        <button
          type="button"
          className="icon-btn-glass h-9 w-9"
          onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() ?? 13) + 1)}
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="icon-btn-glass h-9 w-9"
          onClick={() => mapRef.current?.setZoom((mapRef.current.getZoom() ?? 13) - 1)}
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="icon-btn-glass h-9 w-9"
          onClick={() => {
            if (mapRef.current && stops.length) {
              const bounds = new google.maps.LatLngBounds();
              stops.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
              mapRef.current.fitBounds(bounds, 72);
            } else {
              mapRef.current?.panTo(mapCenter);
            }
          }}
          aria-label="Fit route"
        >
          <Navigation className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
