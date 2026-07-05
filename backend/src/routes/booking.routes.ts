import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { bookingSchema, parseBookingDate } from "../validators/schemas.js";
import {
  createBooking,
  confirmBooking,
  confirmBookingPayment,
  cancelBooking,
  releaseExpiredBookings,
} from "../services/booking.service.js";
import { calculateBookingTotal } from "../services/pricing.service.js";
import { prisma } from "../lib/prisma.js";
import {
  createCheckoutSession,
  fulfillCheckoutSession,
  isStripeEnabled,
  stripe,
} from "../services/stripe.service.js";

import { paramId } from "../utils/params.js";

const router = Router();

router.post(
  "/quote",
  asyncHandler(async (req, res) => {
    await releaseExpiredBookings();
    const { roomId, checkIn, checkOut } = bookingSchema.parse(req.body);
    const quote = await calculateBookingTotal(
      roomId,
      parseBookingDate(checkIn)!,
      parseBookingDate(checkOut)!
    );
    return sendSuccess(res, quote);
  })
);

router.post(
  "/",
  authenticate,
  authorize("TRAVELER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const data = bookingSchema.parse(req.body);
    const booking = await createBooking({
      userId: req.user!.userId,
      roomId: data.roomId,
      checkIn: parseBookingDate(data.checkIn)!,
      checkOut: parseBookingDate(data.checkOut)!,
      guests: data.guests,
    });
    return sendSuccess(res, booking, 201);
  })
);

router.get(
  "/me",
  authenticate,
  authorize("TRAVELER"),
  asyncHandler(async (req, res) => {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.userId },
      include: {
        property: { include: { images: { take: 1 } } },
        room: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, bookings);
  })
);

router.get(
  "/owner",
  authenticate,
  authorize("BUSINESS_OWNER"),
  asyncHandler(async (req, res) => {
    const properties = await prisma.property.findMany({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });
    const bookings = await prisma.booking.findMany({
      where: { propertyId: { in: properties.map((p) => p.id) } },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        room: true,
        property: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, bookings);
  })
);

router.post(
  "/verify-checkout",
  authenticate,
  authorize("TRAVELER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.body as { sessionId?: string };
    if (!sessionId) return sendError(res, "sessionId required", 400);
    if (!isStripeEnabled()) return sendError(res, "Stripe not configured", 503);

    try {
      const booking = await fulfillCheckoutSession(sessionId);
      return sendSuccess(res, booking);
    } catch (e) {
      return sendError(res, e instanceof Error ? e.message : "Verification failed", 400);
    }
  })
);

router.get(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const bookingId = paramId(req.params.id);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true, room: true, user: { select: { id: true, email: true } } },
    });
    if (!booking) return sendError(res, "Not found", 404);
    const isParticipant =
      booking.userId === req.user!.userId ||
      booking.property.ownerId === req.user!.userId ||
      req.user!.role === "ADMIN";
    if (!isParticipant) return sendError(res, "Forbidden", 403);
    return sendSuccess(res, booking);
  })
);

router.post(
  "/:id/checkout-session",
  authenticate,
  authorize("TRAVELER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const bookingId = paramId(req.params.id);
    if (!isStripeEnabled()) {
      return sendSuccess(res, {
        mock: true,
        message: "Stripe not configured — use mock payment",
      });
    }
    try {
      const session = await createCheckoutSession(bookingId, req.user!.userId);
      return sendSuccess(res, session);
    } catch (e) {
      return sendError(res, e instanceof Error ? e.message : "Checkout failed", 400);
    }
  })
);

router.post(
  "/:id/confirm-payment",
  authenticate,
  authorize("TRAVELER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const bookingId = paramId(req.params.id);
    try {
      const booking = await confirmBookingPayment(bookingId, req.user!.userId);
      return sendSuccess(res, booking);
    } catch (e) {
      return sendError(res, e instanceof Error ? e.message : "Confirmation failed", 400);
    }
  })
);

router.patch(
  "/:id/confirm",
  authenticate,
  authorize("BUSINESS_OWNER"),
  asyncHandler(async (req, res) => {
    const booking = await confirmBooking(req.params.id, req.user!.userId);
    return sendSuccess(res, booking);
  })
);

router.patch(
  "/:id/cancel",
  authenticate,
  asyncHandler(async (req, res) => {
    const isOwner = req.user!.role === "BUSINESS_OWNER";
    const booking = await cancelBooking(req.params.id, req.user!.userId, isOwner);
    return sendSuccess(res, booking);
  })
);

router.post(
  "/:id/payment-intent",
  authenticate,
  authorize("TRAVELER"),
  asyncHandler(async (req, res) => {
    const bookingId = paramId(req.params.id);
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: req.user!.userId },
    });
    if (!booking) return sendError(res, "Not found", 404);

    if (!stripe) {
      return sendSuccess(res, {
        mock: true,
        clientSecret: "mock_secret_" + booking.id,
        message: "Stripe not configured — use mock payment in dev",
      });
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(booking.finalTotal) * 100),
      currency: "usd",
      metadata: { bookingId: booking.id, userId: booking.userId },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripePaymentId: intent.id },
    });

    return sendSuccess(res, { clientSecret: intent.client_secret });
  })
);

export default router;
