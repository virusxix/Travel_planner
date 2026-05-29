import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { handleStripeWebhook, isStripeEnabled } from "../services/stripe.service.js";

const router = Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!isStripeEnabled()) {
      return sendError(res, "Stripe not configured", 503);
    }

    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
      return sendError(res, "Missing stripe-signature header", 400);
    }

    const rawBody = req.body as Buffer;
    if (!Buffer.isBuffer(rawBody)) {
      return sendError(res, "Invalid webhook payload", 400);
    }

    try {
      const result = await handleStripeWebhook(rawBody, signature);
      return sendSuccess(res, result);
    } catch (e) {
      console.error("Stripe webhook error:", e);
      return sendError(res, e instanceof Error ? e.message : "Webhook failed", 400);
    }
  })
);

export default router;
