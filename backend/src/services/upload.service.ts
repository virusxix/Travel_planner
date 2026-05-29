import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { env } from "../config/env.js";

const hasCloudinary =
  !!env.CLOUDINARY_CLOUD_NAME && !!env.CLOUDINARY_API_KEY && !!env.CLOUDINARY_API_SECRET;

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

const LOCAL_UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

function ensureUploadDir() {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  }
}

export function isCloudinaryEnabled(): boolean {
  return hasCloudinary;
}

export async function uploadImage(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<string> {
  if (hasCloudinary) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "hiddenstay", resource_type: "image" },
        (err, result) => {
          if (err || !result?.secure_url) reject(err ?? new Error("Cloudinary upload failed"));
          else resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
  }

  ensureUploadDir();
  const ext = path.extname(filename) || (mimetype.includes("png") ? ".png" : ".jpg");
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(LOCAL_UPLOAD_DIR, safeName);
  fs.writeFileSync(filePath, buffer);
  return `http://localhost:${env.PORT}/uploads/${safeName}`;
}

export async function deleteImageByUrl(url: string): Promise<void> {
  if (hasCloudinary && url.includes("cloudinary.com")) {
    const match = url.match(/\/v\d+\/(.+)\.\w+$/);
    if (match?.[1]) {
      await cloudinary.uploader.destroy(`hiddenstay/${match[1].replace(/^hiddenstay\//, "")}`);
    }
    return;
  }
  if (url.includes("/uploads/")) {
    const name = url.split("/uploads/")[1];
    const filePath = path.join(LOCAL_UPLOAD_DIR, name);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}
