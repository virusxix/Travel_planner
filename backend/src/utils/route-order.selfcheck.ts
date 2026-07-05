import { reorderActivitiesForRoute, totalRouteKm } from "./route-order.js";

const pts = [
  { time: "09:00", latitude: 48.86, longitude: 2.35 },
  { time: "11:00", latitude: 48.87, longitude: 2.36 },
  { time: "10:00", latitude: 48.865, longitude: 2.352 },
];
const start = { lat: 48.858, lng: 2.348 };
const ordered = reorderActivitiesForRoute(pts, start);

if (totalRouteKm(ordered, start) > totalRouteKm(pts, start) + 0.01) {
  console.error("route-order self-check failed");
  process.exit(1);
}

console.log("route-order ok");
