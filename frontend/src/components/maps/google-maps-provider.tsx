"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useJsApiLoader } from "@react-google-maps/api";

/** Single loader id app-wide — avoids "included the API multiple times" errors. */
export const GOOGLE_MAPS_LOADER_ID = "hiddenstay-google-maps";

/** Stable reference — required by useJsApiLoader to avoid reload errors */
export const MAP_LIBRARIES = ["places", "marker", "routes", "geometry"] as const;

type GoogleMapsContextValue = {
  apiKey: string;
  isLoaded: boolean;
  loadError: Error | undefined;
  /** Called by useGoogleMaps() on mount — starts loading the Maps script. */
  ensureLoaded: () => void;
};

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  apiKey: "",
  isLoaded: false,
  loadError: undefined,
  ensureLoaded: () => {},
});

export function formatMapLoadError(error: Error | undefined): string {
  if (!error) return "Map failed to load.";
  const msg = error.message || String(error);
  if (/RefererNotAllowed|referer|referrer/i.test(msg)) {
    return "API key blocked by referrer restrictions. In Google Cloud Console → Credentials, add HTTP referrers for your dev port, e.g. http://localhost:3000/* and http://localhost:3002/*";
  }
  if (/InvalidKey|invalid.*key/i.test(msg)) {
    return "Invalid Maps API key. Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in frontend/.env.local and restart npm run dev.";
  }
  if (/BillingNotEnabled|billing/i.test(msg)) {
    return "Enable billing on your Google Cloud project (Maps JavaScript API requires it).";
  }
  if (/ApiNotActivated|not activated/i.test(msg)) {
    return "Enable Maps JavaScript API and Routes API in Google Cloud Console (Directions API alone is not enough for new projects).";
  }
  return msg;
}

/** Mounted only once a consumer asks for maps — keeps the script off pages that don't use it. */
function MapsScriptLoader({
  apiKey,
  onState,
}: {
  apiKey: string;
  onState: (s: { isLoaded: boolean; loadError: Error | undefined }) => void;
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey,
    libraries: MAP_LIBRARIES as unknown as ("places" | "marker" | "routes" | "geometry")[],
    version: "weekly",
    preventGoogleFontsLoading: true,
  });

  useEffect(() => {
    onState({ isLoaded, loadError });
  }, [isLoaded, loadError, onState]);

  return null;
}

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "";
  const [wanted, setWanted] = useState(false);
  const [state, setState] = useState<{ isLoaded: boolean; loadError: Error | undefined }>({
    isLoaded: false,
    loadError: undefined,
  });

  const value = useMemo(
    () => ({ apiKey, ...state, ensureLoaded: () => setWanted(true) }),
    [apiKey, state]
  );

  return (
    <GoogleMapsContext.Provider value={value}>
      {wanted && <MapsScriptLoader apiKey={apiKey} onState={setState} />}
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const ctx = useContext(GoogleMapsContext);
  // consumers mounting = this page needs maps; kick off the script load
  useEffect(() => {
    ctx.ensureLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ctx;
}
