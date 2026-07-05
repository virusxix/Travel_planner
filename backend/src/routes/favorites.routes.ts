import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { paramId } from "../utils/params.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.use(authenticate, authorize("TRAVELER", "ADMIN"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.userId },
      include: {
        property: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 3 },
            rooms: { orderBy: { basePrice: "asc" }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(
      res,
      favorites.map((f) => f.property)
    );
  })
);

router.get(
  "/ids",
  asyncHandler(async (req, res) => {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.userId },
      select: { propertyId: true },
    });
    return sendSuccess(res, favorites.map((f) => f.propertyId));
  })
);

router.post(
  "/:propertyId",
  asyncHandler(async (req, res) => {
    const propertyId = paramId(req.params.propertyId);
    const property = await prisma.property.findUnique({
      where: { id: propertyId, status: "APPROVED" },
    });
    if (!property) return sendError(res, "Property not found", 404);

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_propertyId: {
          userId: req.user!.userId,
          propertyId,
        },
      },
      create: {
        userId: req.user!.userId,
        propertyId,
      },
      update: {},
    });
    return sendSuccess(res, favorite, 201);
  })
);

router.delete(
  "/:propertyId",
  asyncHandler(async (req, res) => {
    const propertyId = paramId(req.params.propertyId);
    await prisma.favorite.deleteMany({
      where: {
        userId: req.user!.userId,
        propertyId,
      },
    });
    return sendSuccess(res, { removed: true });
  })
);

export default router;
