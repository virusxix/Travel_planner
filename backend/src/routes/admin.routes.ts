import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { verifyPropertySchema } from "../validators/schemas.js";
import { getAdminAnalytics } from "../services/analytics.service.js";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get(
  "/properties/pending",
  asyncHandler(async (_req, res) => {
    const properties = await prisma.property.findMany({
      where: { status: "PENDING_REVIEW" },
      include: {
        images: true,
        owner: { select: { email: true, firstName: true, lastName: true } },
        verificationRecord: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    return sendSuccess(res, properties);
  })
);

router.patch(
  "/properties/:id/verify",
  asyncHandler(async (req, res) => {
    const { status, adminNotes } = verifyPropertySchema.parse(req.body);
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: {
        status,
        approvedAt: status === "APPROVED" ? new Date() : null,
      },
    });
    await prisma.verificationRecord.upsert({
      where: { propertyId: req.params.id },
      create: {
        propertyId: req.params.id,
        status,
        adminId: req.user!.userId,
        adminNotes,
        action: status === "APPROVED" ? "APPROVED" : "REJECTED",
      },
      update: {
        status,
        adminId: req.user!.userId,
        adminNotes,
        action: status === "APPROVED" ? "APPROVED" : "REJECTED",
      },
    });
    return sendSuccess(res, property);
  })
);

router.patch(
  "/properties/:id/suspend",
  asyncHandler(async (req, res) => {
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: { status: "SUSPENDED" },
    });
    await prisma.verificationRecord.upsert({
      where: { propertyId: req.params.id },
      create: {
        propertyId: req.params.id,
        status: "SUSPENDED",
        adminId: req.user!.userId,
        action: "SUSPENDED",
        adminNotes: req.body.adminNotes,
      },
      update: {
        status: "SUSPENDED",
        adminId: req.user!.userId,
        action: "SUSPENDED",
      },
    });
    return sendSuccess(res, property);
  })
);

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = 20;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);
    return sendSuccess(res, users, 200, { page, limit, total });
  })
);

router.patch(
  "/users/:id/suspend",
  asyncHandler(async (req, res) => {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
    });
    return sendSuccess(res, user);
  })
);

router.get(
  "/analytics",
  asyncHandler(async (_req, res) => {
    const analytics = await getAdminAnalytics();
    return sendSuccess(res, analytics);
  })
);

export default router;
