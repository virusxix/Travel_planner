"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

/** Single loader id app-wide — avoids "included the API multiple times" errors. */
export const GOOGLE_MAPS_LOADER_ID = "hiddenstay-google-maps";

/** Stable reference — required by useJsApiLoader to avoid reload errors */
export const MAP_LIBRARIES: ("places" | "marker")[] = ["places", "marker"];

type GoogleMapsContextValue = {
  apiKey: string;
  isLoaded: boolean;
  loadError: Error | undefined;
};

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  apiKey: "",
  isLoaded: false,
  loadError: undefined,
});

export function formatMapLoadError(error: Error | undefined): string {
  if (!error) return "Map failed to load.";
  const msg = error.message || String(error);
  if (/RefererNotAllowed|referer|referrer/i.test(msg)) {
    return "API key blocked by referrer restrictions. In Google Cloud Console → Credentials, add HTTP referrers: http://localhost:3000/* and http://localhost:3001/*";
  }
  if (/InvalidKey|invalid.*key/i.test(msg)) {
    return "Invalid Maps API key. Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in frontend/.env.local and restart npm run dev.";
  }
  if (/BillingNotEnabled|billing/i.test(msg)) {
    return "Enable billing on your Google Cloud project (Maps JavaScript API requires it).";
  }
  if (/ApiNotActivated|not activated/i.test(msg)) {
    return "Enable Maps JavaScript API, Places API (New), and Routes API in Google Cloud Console. Do not use legacy Directions API.";
  }
  return msg;
}

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey,
    libraries: MAP_LIBRARIES,
    preventGoogleFontsLoading: true,
  });

  return (
    <GoogleMapsContext.Provider value={{ apiKey, isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}
