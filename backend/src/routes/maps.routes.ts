import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { computeStreetRouteServer } from "../services/google-routes.service.js";

const router = Router();
const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

const bodySchema = z.object({
  stops: z
    .array(
      z.object({
        lat: z.number(),
        lng: z.number(),
        name: z.string().optional(),
      })
    )
    .min(2)
    .max(25),
  travelMode: z.enum(["walk", "bike", "car", "bus", "train"]).default("car"),
});

router.post(
  "/route",
  limiter,
  asyncHandler(async (req, res) => {
    const { stops, travelMode } = bodySchema.parse(req.body);
    try {
      const route = await computeStreetRouteServer(stops, travelMode);
      return sendSuccess(res, route);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return sendError(res, msg, 502);
    }
  })
);

export default router;
