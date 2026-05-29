import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { authenticate } from "../middleware/auth.js";
import { sendTravelChat } from "../services/chat.service.js";
import { getAiProvider } from "../services/ai.service.js";

const router = Router();

const chatLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

const chatBodySchema = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      })
    )
    .max(24)
    .optional(),
  itineraryId: z.string().uuid().optional(),
});

router.post(
  "/",
  authenticate,
  chatLimiter,
  asyncHandler(async (req, res) => {
    if (!getAiProvider()) {
      return sendError(
        res,
        "Configure GEMINI_API_KEY in backend/.env to use AI chat",
        503,
        "AI_UNAVAILABLE"
      );
    }

    const body = chatBodySchema.parse(req.body);
    const result = await sendTravelChat({
      userId: req.user!.userId,
      message: body.message,
      history: body.history,
      itineraryId: body.itineraryId,
    });

    return sendSuccess(res, result);
  })
);

export default router;
