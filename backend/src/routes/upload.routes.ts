import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { uploadImage, isCloudinaryEnabled } from "../services/upload.service.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

router.post(
  "/",
  authenticate,
  authorize("BUSINESS_OWNER", "ADMIN"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) return sendError(res, "No file uploaded", 400);
    const url = await uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
    return sendSuccess(res, { url, provider: isCloudinaryEnabled() ? "cloudinary" : "local" }, 201);
  })
);

export default router;
