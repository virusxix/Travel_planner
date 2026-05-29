import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { recommendHiddenGems } from "../services/recommendation.service.js";
import { getOwnerAnalytics } from "../services/analytics.service.js";
import { prisma } from "../lib/prisma.js";

import { isStripeEnabled } from "../services/stripe.service.js";
import { getAiProvider, getGeminiModels } from "../services/ai.service.js";
import {
  isPlacesEnrichmentEnabled,
  isServerPlacesEnrichmentEnabled,
} from "../services/places.service.js";

const router = Router();

router.get(
  "/config/public",
  asyncHandler(async (_req, res) => {
    return sendSuccess(res, {
      stripeEnabled: isStripeEnabled(),
      mapsEnabled: !!(process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
      aiProvider: getAiProvider(),
      geminiModels: getGeminiModels(),
      placesEnrichment: isPlacesEnrichmentEnabled(),
      serverPlacesDuringGenerate: isServerPlacesEnrichmentEnabled(),
      /** Browser uses referrer key; server Places/Routes REST needs IP-unrestricted key */
      googleApisForBrowser: [
        "Maps JavaScript API",
        "Places API",
        "Routes API",
        "Geocoding API",
      ],
    });
  })
);

router.get(
  "/hidden-gems",
  asyncHandler(async (req, res) => {
    const gems = await recommendHiddenGems({
      city: req.query.city as string,
      country: req.query.country as string,
      category: req.query.category as never,
      lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
      lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 12,
    });
    return sendSuccess(res, gems);
  })
);

router.get(
  "/hidden-gems/recommend",
  asyncHandler(async (req, res) => {
    const gems = await recommendHiddenGems({
      city: req.query.city as string,
      country: req.query.country as string,
      lat: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
      lng: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
    });
    return sendSuccess(res, gems);
  })
);

router.get(
  "/amenities",
  asyncHandler(async (_req, res) => {
    const amenities = await prisma.amenity.findMany({ orderBy: { name: "asc" } });
    return sendSuccess(res, amenities);
  })
);

router.get(
  "/analytics/owner",
  authenticate,
  authorize("BUSINESS_OWNER"),
  asyncHandler(async (req, res) => {
    const analytics = await getOwnerAnalytics(req.user!.userId);
    return sendSuccess(res, analytics);
  })
);

export default router;
