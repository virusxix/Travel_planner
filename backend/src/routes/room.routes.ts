import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { roomSchema, seasonalPriceSchema } from "../validators/schemas.js";
import { prisma } from "../lib/prisma.js";
import { calculateNightlyPrice } from "../services/pricing.service.js";
import { getRoomOccupancyStats } from "../services/booking.service.js";

const router = Router();

async function assertOwner(propertyId: string, userId: string, role: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new Error("Property not found");
  if (property.ownerId !== userId && role !== "ADMIN") throw new Error("Forbidden");
  return property;
}

router.get(
  "/property/:propertyId",
  asyncHandler(async (req, res) => {
    const rooms = await prisma.room.findMany({
      where: { propertyId: req.params.propertyId },
      include: { images: true, seasonalPrices: true },
    });
    return sendSuccess(res, rooms);
  })
);

router.post(
  "/property/:propertyId",
  authenticate,
  authorize("BUSINESS_OWNER"),
  asyncHandler(async (req, res) => {
    await assertOwner(req.params.propertyId, req.user!.userId, req.user!.role);
    const data = roomSchema.parse(req.body);
    const room = await prisma.room.create({
      data: {
        propertyId: req.params.propertyId,
        name: data.name,
        roomType: data.roomType,
        capacity: data.capacity,
        basePrice: data.basePrice,
        description: data.description,
        quantity: data.quantity,
        availableCount: data.quantity,
        images: data.imageUrls
          ? { create: data.imageUrls.map((url, i) => ({ url, sortOrder: i })) }
          : undefined,
      },
      include: { images: true },
    });
    return sendSuccess(res, room, 201);
  })
);

router.patch(
  "/:id",
  authenticate,
  authorize("BUSINESS_OWNER"),
  asyncHandler(async (req, res) => {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: { property: true },
    });
    if (!room) return sendError(res, "Not found", 404);
    await assertOwner(room.propertyId, req.user!.userId, req.user!.role);
    const body = req.body as Record<string, unknown>;
    const { imageUrls, availableCount, ...rest } = body;
    const data = roomSchema.partial().parse(rest);
    const updateData: Record<string, unknown> = { ...data };
    if (availableCount != null) updateData.availableCount = Number(availableCount);

    const updated = await prisma.room.update({
      where: { id: req.params.id },
      data: updateData,
      include: { images: true, seasonalPrices: true },
    });

    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      const count = await prisma.roomImage.count({ where: { roomId: req.params.id } });
      await prisma.roomImage.createMany({
        data: (imageUrls as string[]).map((url, i) => ({
          roomId: req.params.id,
          url,
          sortOrder: count + i,
        })),
      });
    }

    const withImages = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: { images: true, seasonalPrices: true },
    });
    return sendSuccess(res, withImages ?? updated);
  })
);

router.delete(
  "/:id",
  authenticate,
  authorize("BUSINESS_OWNER"),
  asyncHandler(async (req, res) => {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: { property: true },
    });
    if (!room) return sendError(res, "Not found", 404);
    await assertOwner(room.propertyId, req.user!.userId, req.user!.role);
    await prisma.room.delete({ where: { id: req.params.id } });
    return sendSuccess(res, { deleted: true });
  })
);

router.patch(
  "/:id/availability",
  authenticate,
  authorize("BUSINESS_OWNER"),
  asyncHandler(async (req, res) => {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: { property: true },
    });
    if (!room) return sendError(res, "Not found", 404);
    await assertOwner(room.propertyId, req.user!.userId, req.user!.role);

    const { date, available, quantity } = req.body as {
      date?: string;
      available?: number;
      quantity?: number;
    };

    if (quantity != null) {
      await prisma.room.update({
        where: { id: req.params.id },
        data: { quantity, availableCount: quantity },
      });
    }

    if (date && available != null) {
      await prisma.roomAvailability.upsert({
        where: { roomId_date: { roomId: req.params.id, date: new Date(date) } },
        create: { roomId: req.params.id, date: new Date(date), available },
        update: { available },
      });
    }

    const updated = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: { availability: true },
    });
    return sendSuccess(res, updated);
  })
);

router.post(
  "/:id/seasonal-prices",
  authenticate,
  authorize("BUSINESS_OWNER"),
  asyncHandler(async (req, res) => {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: { property: true },
    });
    if (!room) return sendError(res, "Not found", 404);
    await assertOwner(room.propertyId, req.user!.userId, req.user!.role);
    const data = seasonalPriceSchema.parse(req.body);
    const seasonal = await prisma.seasonalPrice.create({
      data: {
        roomId: req.params.id,
        seasonType: data.seasonType,
        multiplier: data.multiplier,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    return sendSuccess(res, seasonal, 201);
  })
);

router.get(
  "/:id/stats",
  authenticate,
  authorize("BUSINESS_OWNER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: { property: true },
    });
    if (!room) return sendError(res, "Not found", 404);
    await assertOwner(room.propertyId, req.user!.userId, req.user!.role);
    const stats = await getRoomOccupancyStats(req.params.id);
    return sendSuccess(res, stats);
  })
);

router.post(
  "/:id/images",
  authenticate,
  authorize("BUSINESS_OWNER"),
  asyncHandler(async (req, res) => {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: { property: true },
    });
    if (!room) return sendError(res, "Not found", 404);
    await assertOwner(room.propertyId, req.user!.userId, req.user!.role);
    const { url } = req.body as { url: string };
    if (!url) return sendError(res, "url required", 400);
    const count = await prisma.roomImage.count({ where: { roomId: req.params.id } });
    const image = await prisma.roomImage.create({
      data: { roomId: req.params.id, url, sortOrder: count },
    });
    return sendSuccess(res, image, 201);
  })
);

router.delete(
  "/:id/images/:imageId",
  authenticate,
  authorize("BUSINESS_OWNER"),
  asyncHandler(async (req, res) => {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: { property: true },
    });
    if (!room) return sendError(res, "Not found", 404);
    await assertOwner(room.propertyId, req.user!.userId, req.user!.role);
    await prisma.roomImage.deleteMany({
      where: { id: req.params.imageId, roomId: req.params.id },
    });
    return sendSuccess(res, { deleted: true });
  })
);

router.get(
  "/:id/price",
  asyncHandler(async (req, res) => {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const pricing = await calculateNightlyPrice(req.params.id, date);
    return sendSuccess(res, pricing);
  })
);

export default router;
