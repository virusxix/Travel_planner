"use client";

export type PlaceHit = {
  latitude: number;
  longitude: number;
  imageUrl?: string;
  placeId?: string;
  location?: string;
};

/** Places API (New) via Maps JS — works with referrer-restricted browser keys. */
export async function searchPlaceInBrowser(
  query: string,
  bias?: google.maps.LatLngLiteral
): Promise<PlaceHit | null> {
  if (typeof google === "undefined") return null;

  try {
    const { Place } = (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;

    const request: google.maps.places.SearchByTextRequest = {
      textQuery: query,
      fields: ["displayName", "location", "photos", "formattedAddress", "id"],
      maxResultCount: 1,
    };

    if (bias) {
      request.locationBias = {
        center: bias,
        radius: 25000,
      };
    }

    const { places } = await Place.searchByText(request);
    const place = places?.[0];
    if (!place?.location) return null;

    const lat = place.location.lat();
    const lng = place.location.lng();
    const photoUrl = place.photos?.[0]?.getURI({ maxWidth: 400 });

    return {
      latitude: lat,
      longitude: lng,
      placeId: place.id,
      imageUrl: photoUrl,
      location: place.formattedAddress ?? place.displayName ?? undefined,
    };
  } catch (e) {
    console.warn("Place.searchByText failed:", e);
    return null;
  }
}

export function geocodeInBrowser(address: string): Promise<google.maps.LatLngLiteral | null> {
  return new Promise((resolve) => {
    if (!google.maps?.Geocoder) {
      resolve(null);
      return;
    }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status !== "OK" || !results?.[0]?.geometry?.location) {
        resolve(null);
        return;
      }
      const loc = results[0].geometry.location;
      resolve({ lat: loc.lat(), lng: loc.lng() });
    });
  });
}
