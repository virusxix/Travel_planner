import { Router } from "express";
import { PropertyStatus, Prisma } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { propertySchema } from "../validators/schemas.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      country,
      city,
      minPrice,
      maxPrice,
      minRating,
      type,
      amenities,
      page = "1",
      limit = "12",
      search,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.PropertyWhereInput = {
      status: "APPROVED",
      ...(country && { country: { contains: country as string, mode: "insensitive" } }),
      ...(city && { city: { contains: city as string, mode: "insensitive" } }),
      ...(type && { type: type as Prisma.EnumPropertyTypeFilter }),
      ...(minRating && { avgRating: { gte: parseFloat(minRating as string) } }),
      ...(search && {
        OR: [
          { name: { contains: search as string, mode: "insensitive" } },
          { city: { contains: search as string, mode: "insensitive" } },
          { description: { contains: search as string, mode: "insensitive" } },
        ],
      }),
    };

    if (amenities) {
      const ids = (amenities as string).split(",");
      where.amenities = { some: { amenityId: { in: ids } } };
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { avgRating: "desc" },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 3 },
          amenities: { include: { amenity: true } },
          rooms: { orderBy: { basePrice: "asc" }, take: 1 },
        },
      }),
      prisma.property.count({ where }),
    ]);

    let filtered = properties;
    if (minPrice || maxPrice) {
      const min = minPrice ? parseFloat(minPrice as string) : 0;
      const max = maxPrice ? parseFloat(maxPrice as string) : Infinity;
      filtered = properties.filter((p) => {
        const price = p.rooms[0] ? Number(p.rooms[0].basePrice) : 0;
        return price >= min && price <= max;
      });
    }

    return sendSuccess(res, filtered, 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  })
);

router.get(
  "/owner/me",
  authenticate,
  authorize("BUSINESS_OWNER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const properties = await prisma.property.findMany({
      where: { ownerId: req.user!.userId },
      include: {
        images: true,
        rooms: true,
        verificationRecord: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return sendSuccess(res, properties);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        amenities: { include: { amenity: true } },
        rooms: { include: { images: true, seasonalPrices: true } },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        owner: { select: { firstName: true, lastName: true } },
      },
    });
    if (!property) return sendError(res, "Property not found", 404);
    if (property.status !== "APPROVED") {
      const isOwner = req.user?.userId === property.ownerId;
      const isAdmin = req.user?.role === "ADMIN";
      if (!isOwner && !isAdmin) return sendError(res, "Property not found", 404);
    }
    return sendSuccess(res, property);
  })
);

router.post(
  "/",
  authenticate,
  authorize("BUSINESS_OWNER"),
  asyncHandler(async (req, res) => {
    const data = propertySchema.parse(req.body);
    const property = await prisma.property.create({
      data: {
        ownerId: req.user!.userId,
        name: data.name,
        type: data.type,
        description: data.description,
        address: data.address,
        city: data.city,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        status: "DRAFT",
        images: data.imageUrls
          ? { create: data.imageUrls.map((url, i) => ({ url, sortOrder: i })) }
          : undefined,
        amenities: data.amenityIds
          ? { create: data.amenityIds.map((amenityId) => ({ amenityId })) }
          : undefined,
      },
      include: { images: true, amenities: { include: { amenity: true } } },
    });
    return sendSuccess(res, property, 201);
  })
);

router.patch(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property) return sendError(res, "Not found", 404);
    if (property.ownerId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return sendError(res, "Forbidden", 403);
    }
    const body = req.body as Record<string, unknown>;
    const { amenityIds, imageUrls, ...rest } = body;
    const data = propertySchema.partial().parse(rest);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.property.update({ where: { id: req.params.id }, data });

      if (Array.isArray(amenityIds)) {
        await tx.propertyAmenity.deleteMany({ where: { propertyId: req.params.id } });
        if (amenityIds.length > 0) {
          await tx.propertyAmenity.createMany({
            data: (amenityIds as string[]).map((amenityId) => ({
              propertyId: req.params.id,
              amenityId,
            })),
          });
        }
      }

      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        const existing = await tx.propertyImage.count({ where: { propertyId: req.params.id } });
        await tx.propertyImage.createMany({
          data: (imageUrls as string[]).map((url, i) => ({
            propertyId: req.params.id,
            url,
            sortOrder: existing + i,
          })),
        });
      }

      return tx.property.findUnique({
        where: { id: req.params.id },
        include: { images: { orderBy: { sortOrder: "asc" } }, amenities: { include: { amenity: true } }, rooms: true },
      });
    });
    return sendSuccess(res, updated);
  })
);

router.post(
  "/:id/images",
  authenticate,
  asyncHandler(async (req, res) => {
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property) return sendError(res, "Not found", 404);
    if (property.ownerId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return sendError(res, "Forbidden", 403);
    }
    const { url, caption } = req.body as { url: string; caption?: string };
    if (!url) return sendError(res, "url required", 400);
    const count = await prisma.propertyImage.count({ where: { propertyId: req.params.id } });
    const image = await prisma.propertyImage.create({
      data: { propertyId: req.params.id, url, caption, sortOrder: count },
    });
    return sendSuccess(res, image, 201);
  })
);

router.delete(
  "/:id/images/:imageId",
  authenticate,
  asyncHandler(async (req, res) => {
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property) return sendError(res, "Not found", 404);
    if (property.ownerId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return sendError(res, "Forbidden", 403);
    }
    const image = await prisma.propertyImage.findFirst({
      where: { id: req.params.imageId, propertyId: req.params.id },
    });
    if (!image) return sendError(res, "Image not found", 404);
    await prisma.propertyImage.delete({ where: { id: req.params.imageId } });
    return sendSuccess(res, { deleted: true });
  })
);

router.delete(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property) return sendError(res, "Not found", 404);
    if (property.ownerId !== req.user!.userId && req.user!.role !== "ADMIN") {
      return sendError(res, "Forbidden", 403);
    }
    await prisma.property.delete({ where: { id: req.params.id } });
    return sendSuccess(res, { deleted: true });
  })
);

router.post(
  "/:id/submit",
  authenticate,
  authorize("BUSINESS_OWNER"),
  asyncHandler(async (req, res) => {
    const property = await prisma.property.findFirst({
      where: { id: req.params.id, ownerId: req.user!.userId },
    });
    if (!property) return sendError(res, "Not found", 404);

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.property.update({
        where: { id: req.params.id },
        data: { status: "PENDING_REVIEW" },
      });
      await tx.verificationRecord.upsert({
        where: { propertyId: req.params.id },
        create: {
          propertyId: req.params.id,
          status: "PENDING_REVIEW",
          action: "SUBMITTED",
        },
        update: { status: "PENDING_REVIEW", action: "RESUBMITTED" },
      });
      return p;
    });
    return sendSuccess(res, updated);
  })
);

export default router;
