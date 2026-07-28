import { useCallback, useMemo } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import { Button } from '@/components/ui/button';

const MAPS_KEY = (process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '').trim();
const LIBRARIES = ['places'];

const numberedStayIcon = (n) =>
  new L.DivIcon({
    className: 'hidden-stay-marker',
    html: `<div class="hidden-stay-pin"><span>${n}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [points, map]);
  return null;
}

const userLocationIcon = new L.DivIcon({
  className: 'hidden-stay-marker',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,0.25)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function LeafletFallback({ properties, onBookProperty, height, center, zoom, userLocation }) {
  const fitPoints =
    properties?.length > 0
      ? properties
      : userLocation
        ? [{ lat: userLocation.lat, lng: userLocation.lng }]
        : [];

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border" data-testid="itinerary-map">
      <MapContainer center={center} zoom={zoom} style={{ height, width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={fitPoints} />
        {userLocation && (!properties || properties.length === 0) && (
          <LeafletMarker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <p className="text-sm font-medium">You are here</p>
            </Popup>
          </LeafletMarker>
        )}
        {properties.map((prop, index) => (
          <LeafletMarker key={prop.id} position={[prop.lat, prop.lng]} icon={numberedStayIcon(index + 1)}>
            <Popup>
              <div className="min-w-[200px] p-1">
                <p className="font-semibold text-foreground text-sm mb-1">{prop.name}</p>
                <p className="text-xs text-muted-foreground mb-2">{prop.city}</p>
                <p className="text-sm font-semibold text-primary mb-2">
                  SGD {prop.price_per_night || prop.price} / night
                </p>
                {onBookProperty && (
                  <Button
                    onClick={() => onBookProperty(prop)}
                    size="sm"
                    className="w-full rounded-full text-xs h-8"
                    data-testid={`map-book-${prop.id}`}
                  >
                    View &amp; Book
                  </Button>
                )}
              </div>
            </Popup>
          </LeafletMarker>
        ))}
      </MapContainer>
    </div>
  );
}

function GoogleItineraryMap({ properties, onBookProperty, height, center, zoom, userLocation }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'hiddenstay-google-maps',
    googleMapsApiKey: MAPS_KEY,
    libraries: LIBRARIES,
  });

  const mapCenter = useMemo(
    () => ({ lat: center[0], lng: center[1] }),
    [center]
  );

  const fitMap = useCallback(
    (map) => {
      if (!map) return;
      if (!properties?.length) {
        if (userLocation) {
          map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
          map.setZoom(zoom || 14);
          return;
        }
        map.setCenter(mapCenter);
        map.setZoom(zoom || 12);
        return;
      }
      if (properties.length === 1) {
        map.setCenter({ lat: properties[0].lat, lng: properties[0].lng });
        map.setZoom(13);
        return;
      }
      const bounds = new window.google.maps.LatLngBounds();
      properties.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds, 48);
    },
    [properties, mapCenter, zoom, userLocation]
  );

  const onLoad = useCallback((map) => fitMap(map), [fitMap]);

  if (loadError) {
    return (
      <div
        className="w-full rounded-2xl border border-border bg-muted flex items-center justify-center p-6 text-sm text-destructive text-center"
        style={{ height }}
        data-testid="itinerary-map"
      >
        Google Maps failed to load. Check REACT_APP_GOOGLE_MAPS_API_KEY and HTTP referrer
        restrictions for localhost:3000.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="w-full rounded-2xl border border-border bg-muted animate-pulse"
        style={{ height }}
        data-testid="itinerary-map"
      />
    );
  }

  return (
    <div
      className="w-full h-full rounded-2xl overflow-hidden border border-border"
      style={{ height }}
      data-testid="itinerary-map"
    >
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        options={{
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: true,
        }}
      >
        {userLocation && (!properties || properties.length === 0) && (
          <Marker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            title="You are here"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#2563eb',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
          />
        )}
        {properties.map((prop, index) => (
          <Marker
            key={prop.id}
            position={{ lat: prop.lat, lng: prop.lng }}
            title={`${index + 1}. ${prop.name}`}
            label={{
              text: String(index + 1),
              color: '#fff',
              fontWeight: '700',
              fontSize: '11px',
            }}
            onClick={() => onBookProperty?.(prop)}
          />
        ))}
      </GoogleMap>
    </div>
  );
}

export default function ItineraryMap({
  properties = [],
  onBookProperty,
  height = '100%',
  center = [18.7883, 98.9853],
  zoom = 12,
  userLocation = null,
}) {
  if (!MAPS_KEY) {
    return (
      <LeafletFallback
        properties={properties}
        onBookProperty={onBookProperty}
        height={height}
        center={center}
        zoom={zoom}
        userLocation={userLocation}
      />
    );
  }

  return (
    <GoogleItineraryMap
      properties={properties}
      onBookProperty={onBookProperty}
      height={height}
      center={center}
      zoom={zoom}
      userLocation={userLocation}
    />
  );
}
