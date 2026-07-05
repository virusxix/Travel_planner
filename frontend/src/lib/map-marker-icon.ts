import { ROUTE_COLORS } from "@/lib/route-theme";

/** Numbered pin — brand blue/indigo, soft shadow for light maps */
export function brandedNumberedMarkerSvg(order: number): string {
  const n = String(order);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${ROUTE_COLORS.main}"/>
      <stop offset="55%" style="stop-color:#3b82f6"/>
      <stop offset="100%" style="stop-color:${ROUTE_COLORS.accent}"/>
    </linearGradient>
    <filter id="s" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#1e3a8a" flood-opacity="0.35"/>
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.12"/>
    </filter>
  </defs>
  <circle cx="24" cy="24" r="20" fill="url(#g)" filter="url(#s)"/>
  <circle cx="24" cy="24" r="14" fill="#ffffff"/>
  <text x="24" y="29" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#1e293b">${n}</text>
</svg>`;
}

export function brandedNumberedMarkerIcon(
  order: number
): google.maps.Icon | undefined {
  if (typeof google === "undefined") return undefined;
  const svg = encodeURIComponent(brandedNumberedMarkerSvg(order));
  return {
    url: `data:image/svg+xml;charset=UTF-8,${svg}`,
    scaledSize: new google.maps.Size(48, 48),
    anchor: new google.maps.Point(24, 24),
  };
}

/** @deprecated use brandedNumberedMarkerIcon */
export const teravueNumberedMarkerIcon = brandedNumberedMarkerIcon;
