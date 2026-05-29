/** Numbered pin — violet/pink brand, readable on Google default dark map */
export function brandedNumberedMarkerSvg(order: number): string {
  const n = String(order);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316"/>
      <stop offset="50%" style="stop-color:#ec4899"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
    <filter id="s" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>
  <circle cx="24" cy="24" r="20" fill="url(#g)" filter="url(#s)"/>
  <circle cx="24" cy="24" r="14" fill="#ffffff"/>
  <text x="24" y="29" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#1e1b2e">${n}</text>
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
