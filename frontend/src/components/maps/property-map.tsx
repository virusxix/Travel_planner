"use client";

import { useMemo } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps, formatMapLoadError } from "@/components/maps/google-maps-provider";

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const lightMapStyles = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
];

export function PropertyMap({
  center,
  markers = [],
  height = "320px",
}: {
  center: { lat: number; lng: number };
  markers?: MapMarker[];
  height?: string;
}) {
  const { apiKey, isLoaded, loadError } = useGoogleMaps();
  const mapCenter = useMemo(() => center, [center.lat, center.lng]);
  const containerStyle = useMemo(
    () => ({ width: "100%", height }),
    [height]
  );

  if (!apiKey) {
    return (
      <div
        className="flex items-center justify-center rounded-xl y-card text-sm text-slate-600"
        style={{ height }}
      >
        <div className="text-center p-6 max-w-xs">
          <p className="font-medium text-slate-900">Map preview</p>
          <p className="mt-1 text-xs">
            {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
          </p>
          <p className="mt-3 text-xs leading-relaxed">
            Add your key to <code className="text-brand-600">frontend/.env.local</code> and restart
            the dev server.
          </p>
          {markers.map((m) => (
            <p key={m.id} className="text-xs mt-2 text-left">
              📍 {m.name}
            </p>
          ))}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="flex items-center justify-center rounded-xl y-card text-sm text-red-600 p-6 text-center"
        style={{ height }}
      >
        {formatMapLoadError(loadError)}
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="animate-pulse rounded-xl bg-slate-200" style={{ height, width: "100%" }} />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={13}
      options={{
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: "greedy",
        colorScheme: "DARK",
        styles: lightMapStyles,
        backgroundColor: "#0a1622",
      }}
    >
      {markers.map((m) => (
        <Marker key={m.id} position={{ lat: m.lat, lng: m.lng }} title={m.name} />
      ))}
    </GoogleMap>
  );
}
