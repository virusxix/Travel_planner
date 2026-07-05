import { prisma } from "../lib/prisma.js";
import { parseTimeMinutes, reorderActivitiesForRoute } from "../utils/route-order.js";
import { geocodeDestination } from "./places.service.js";

/** Persist geographically sensible visit order (updates activity times). */
export async function applyRouteOrderToItinerary(itineraryId: string): Promise<void> {
  const itinerary = await prisma.itinerary.findUnique({
    where: { id: itineraryId },
    include: {
      days: {
        include: { activities: true },
        orderBy: { dayNumber: "asc" },
      },
    },
  });
  if (!itinerary?.days.length) return;

  const center = await geocodeDestination(itinerary.destination, itinerary.country);
  if (!center) return;

  for (const day of itinerary.days) {
    const activities = [...day.activities].sort(
      (a, b) => parseTimeMinutes(a.time) - parseTimeMinutes(b.time)
    );
    if (activities.length < 2) continue;

    const reordered = reorderActivitiesForRoute(activities, center);

    await Promise.all(
      reordered.map((act) =>
        prisma.itineraryActivity.update({
          where: { id: act.id },
          data: { time: act.time ?? undefined },
        })
      )
    );
  }
}
