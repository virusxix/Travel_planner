import "dotenv/config";
import { geocodeDestination, enrichActivity } from "../dist/services/places.service.js";

const dest = process.argv[2] || "Tokyo";
const country = process.argv[3] || "Japan";

const center = await geocodeDestination(dest, country);
console.log("Geocode:", center);

const place = await enrichActivity(
  { title: "Senso-ji Temple", location: "Asakusa" },
  dest,
  country,
  center ?? undefined
);
console.log("Place:", place);
