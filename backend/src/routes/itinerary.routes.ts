import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { authenticate } from "../middleware/auth.js";
import { itinerarySchema } from "../validators/schemas.js";
import { generateItinerary, regenerateItineraryDay } from "../services/ai.service.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

router.post(
  "/generate",
  authenticate,
  aiLimiter,
  asyncHandler(async (req, res) => {
    const input = itinerarySchema.parse(req.body);
    const result = await generateItinerary(req.user!.userId, input);
    return sendSuccess(res, result, 201);
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const itineraries = await prisma.itinerary.findMany({
      where: { userId: req.user!.userId },
      include: { days: { include: { activities: true } } },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, itineraries);
  })
);

router.get(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const itinerary = await prisma.itinerary.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: { days: { include: { activities: true }, orderBy: { dayNumber: "asc" } } },
    });
    if (!itinerary) return sendError(res, "Not found", 404);
    return sendSuccess(res, itinerary);
  })
);

router.post(
  "/:id/regenerate",
  authenticate,
  aiLimiter,
  asyncHandler(async (req, res) => {
    const existing = await prisma.itinerary.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!existing) return sendError(res, "Not found", 404);

    const input = {
      destination: existing.destination,
      country: existing.country,
      startDate: existing.startDate.toISOString().split("T")[0],
      endDate: existing.endDate.toISOString().split("T")[0],
      travelers: existing.travelers,
      budget: Number(existing.budget),
      interests: existing.interests,
    };

    await prisma.itinerary.delete({ where: { id: req.params.id } });
    const result = await generateItinerary(req.user!.userId, input);
    return sendSuccess(res, result);
  })
);

const enrichPlacesSchema = z.object({
  updates: z.array(
    z.object({
      activityId: z.string().uuid(),
      latitude: z.number(),
      longitude: z.number(),
      imageUrl: z.string().min(1).optional(),
      placeId: z.string().optional(),
      location: z.string().optional(),
    })
  ),
});

router.patch(
  "/:id/enrich-places",
  authenticate,
  asyncHandler(async (req, res) => {
    const itineraryId = String(req.params.id);
    const { updates } = enrichPlacesSchema.parse(req.body);

    const itinerary = await prisma.itinerary.findFirst({
      where: { id: itineraryId, userId: req.user!.userId },
      include: { days: { include: { activities: true } } },
    });
    if (!itinerary) return sendError(res, "Not found", 404);

    const activityIds = new Set(
      itinerary.days.flatMap((d) => d.activities.map((a) => a.id))
    );

    for (const u of updates) {
      if (!activityIds.has(u.activityId)) continue;
      await prisma.itineraryActivity.update({
        where: { id: u.activityId },
        data: {
          latitude: u.latitude,
          longitude: u.longitude,
          imageUrl: u.imageUrl ?? undefined,
          placeId: u.placeId ?? undefined,
          location: u.location ?? undefined,
        },
      });
    }

    const updated = await prisma.itinerary.findFirst({
      where: { id: itineraryId },
      include: { days: { include: { activities: true }, orderBy: { dayNumber: "asc" } } },
    });
    return sendSuccess(res, updated);
  })
);

router.post(
  "/:id/days/:dayNumber/regenerate",
  authenticate,
  aiLimiter,
  asyncHandler(async (req, res) => {
    const dayNumber = parseInt(req.params.dayNumber, 10);
    const result = await regenerateItineraryDay(
      req.params.id,
      dayNumber,
      req.user!.userId
    );
    return sendSuccess(res, result);
  })
);

export default router;
