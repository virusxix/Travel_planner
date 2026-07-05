/** New Routes library types missing from @types/google.maps */
declare namespace google.maps.routes {
  interface ComputeRoutesRequest {
    origin: google.maps.LatLngLiteral | string;
    destination: google.maps.LatLngLiteral | string;
    intermediates?: google.maps.LatLngLiteral[];
    travelMode?: google.maps.TravelMode | string;
    fields: string[];
  }

  interface RouteLeg {
    distanceMeters?: number;
    durationMillis?: number;
    staticDurationMillis?: number;
    localizedValues?: {
      distance?: { text?: string };
      duration?: { text?: string };
      staticDuration?: { text?: string };
    };
  }

  interface Route {
    path?: Array<google.maps.LatLng | google.maps.LatLngLiteral | google.maps.LatLngAltitude>;
    legs?: RouteLeg[];
    durationMillis?: number;
    staticDurationMillis?: number;
    distanceMeters?: number;
    localizedValues?: {
      distance?: { text?: string };
      duration?: { text?: string };
      staticDuration?: { text?: string };
    };
  }
}

declare namespace google.maps {
  interface RoutesLibrary {
    Route?: {
      computeRoutes(
        request: google.maps.routes.ComputeRoutesRequest
      ): Promise<{ routes?: google.maps.routes.Route[] }>;
    };
  }
}
