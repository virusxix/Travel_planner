import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { registerSchema, loginSchema } from "../validators/schemas.js";
import {
  registerUser,
  loginUser,
  signAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  requestPasswordReset,
  resetPassword,
  toAuthPayload,
} from "../services/auth.service.js";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    if (data.role === "BUSINESS_OWNER" && !data.businessName) {
      return sendError(res, "Business name required for owners", 400);
    }
    const user = await registerUser(data);
    const payload = toAuthPayload(user);
    const accessToken = signAccessToken(payload);
    const refreshToken = await createRefreshToken(user.id);
    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    }, 201);
  })
);

router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await loginUser(email, password);
    const payload = toAuthPayload(user);
    const accessToken = signAccessToken(payload);
    const refreshToken = await createRefreshToken(user.id);
    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    });
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const user = await verifyRefreshToken(refreshToken);
    if (!user) return sendError(res, "Invalid refresh token", 401);
    const payload = toAuthPayload(user);
    const accessToken = signAccessToken(payload);
    const newRefresh = await createRefreshToken(user.id);
    return sendSuccess(res, { accessToken, refreshToken: newRefresh });
  })
);

router.post(
  "/forgot-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const token = await requestPasswordReset(email);
    if (process.env.NODE_ENV === "development" && token) {
      console.log(`[DEV] Password reset token for ${email}: ${token}`);
    }
    return sendSuccess(res, { message: "If the email exists, a reset link was sent." });
  })
);

router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { token, password } = z
      .object({ token: z.string(), password: z.string().min(8) })
      .parse(req.body);
    await resetPassword(token, password);
    return sendSuccess(res, { message: "Password updated" });
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        businessProfile: true,
        createdAt: true,
      },
    });
    return sendSuccess(res, user);
  })
);

router.patch(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        avatarUrl: z.string().url().optional(),
      })
      .parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        businessProfile: true,
        createdAt: true,
      },
    });
    return sendSuccess(res, user);
  })
);

export default router;
