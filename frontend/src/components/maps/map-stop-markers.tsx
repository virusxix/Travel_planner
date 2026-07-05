"use client";

import { useEffect } from "react";
import type { ItineraryMapStop } from "@/components/maps/itinerary-map";

function buildMarkerContent(stop: ItineraryMapStop): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "position:relative;display:flex;align-items:center;justify-content:center;width:52px;height:52px;";

  const badge = document.createElement("div");
  badge.style.cssText =
    "width:36px;height:36px;border-radius:9999px;background:linear-gradient(135deg,#1d85e4,#3b82f6,#4f46e5);padding:2px;box-shadow:0 3px 10px rgba(30,64,175,0.35),0 1px 3px rgba(0,0,0,0.12);display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;font-size:14px;font-weight:700;color:#1e293b;";
  const inner = document.createElement("div");
  inner.style.cssText =
    "width:100%;height:100%;border-radius:9999px;background:#fff;display:flex;align-items:center;justify-content:center;";
  inner.textContent = String(stop.order);
  badge.appendChild(inner);
  wrap.appendChild(badge);

  if (stop.imageUrl) {
    const photo = document.createElement("img");
    photo.src = stop.imageUrl;
    photo.alt = stop.name;
    photo.referrerPolicy = "no-referrer";
    photo.style.cssText =
      "position:absolute;top:-4px;right:-6px;width:28px;height:28px;border-radius:9999px;object-fit:cover;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);";
    photo.onerror = () => {
      photo.remove();
    };
    wrap.appendChild(photo);
  }

  return wrap;
}

export function MapStopMarkers({
  map,
  stops,
}: {
  map: google.maps.Map | null;
  stops: ItineraryMapStop[];
}) {
  const stopsKey = stops
    .map((s) => `${s.id}:${s.order}:${s.lat.toFixed(5)},${s.lng.toFixed(5)}:${s.imageUrl ?? ""}`)
    .join("|");

  useEffect(() => {
    if (!map || stops.length === 0) return;

    let cancelled = false;
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];

    (async () => {
      try {
        await google.maps.importLibrary("marker");
        if (cancelled) return;

        for (const stop of stops) {
          const el = buildMarkerContent(stop);
          const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: stop.lat, lng: stop.lng },
            title: stop.name,
            content: el,
            zIndex: 10 + stop.order,
          });
          markers.push(marker);
        }
      } catch (e) {
        console.warn("Advanced markers:", e);
      }
    })();

    return () => {
      cancelled = true;
      markers.forEach((m) => {
        m.map = null;
      });
    };
  }, [map, stopsKey, stops]);

  return null;
}
