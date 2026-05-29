import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { reviewSchema } from "../validators/schemas.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get(
  "/property/:propertyId",
  asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
      where: { propertyId: req.params.propertyId },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const breakdown = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));

    const property = await prisma.property.findUnique({
      where: { id: req.params.propertyId },
      select: { avgRating: true, reviewCount: true },
    });

    return sendSuccess(res, {
      reviews,
      avgRating: property?.avgRating ?? 0,
      total: property?.reviewCount ?? 0,
      breakdown,
    });
  })
);

router.post(
  "/property/:propertyId",
  authenticate,
  authorize("TRAVELER"),
  asyncHandler(async (req, res) => {
    const data = reviewSchema.parse(req.body);
    const review = await prisma.review.create({
      data: {
        userId: req.user!.userId,
        propertyId: req.params.propertyId,
        rating: data.rating,
        title: data.title,
        content: data.content,
        images: data.imageUrls
          ? { create: data.imageUrls.map((url) => ({ url })) }
          : undefined,
      },
      include: { images: true },
    });

    const agg = await prisma.review.aggregate({
      where: { propertyId: req.params.propertyId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.property.update({
      where: { id: req.params.propertyId },
      data: {
        avgRating: agg._avg.rating ?? 0,
        reviewCount: agg._count,
      },
    });

    return sendSuccess(res, review, 201);
  })
);

router.delete(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) return sendError(res, "Not found", 404);
    if (review.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return sendError(res, "Forbidden", 403);
    }
    await prisma.review.delete({ where: { id: req.params.id } });
    const agg = await prisma.review.aggregate({
      where: { propertyId: review.propertyId },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.property.update({
      where: { id: review.propertyId },
      data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count },
    });
    return sendSuccess(res, { deleted: true });
  })
);

export default router;
