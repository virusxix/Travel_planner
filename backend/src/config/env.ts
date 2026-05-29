import { z } from "zod";
import dotenv from "dotenv";

import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  OPENAI_API_KEY: z.string().optional(),
  /** Groq API key (gsk_...) — https://console.groq.com/keys */
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  GEMINI_API_KEY: z.string().optional(),
  /** Comma-separated Gemini model ids (first available wins) */
  GEMINI_MODELS: z.string().default("gemini-2.5-flash"),
  /** gemini | openai | groq | auto */
  AI_PROVIDER: z.enum(["gemini", "openai", "groq", "auto"]).default("auto"),
  /** When false, AI failures return an error instead of generic demo itinerary */
  ALLOW_DEMO_ITINERARY: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  /** Server-side Places during generate (slow). Browser enrichment is default. */
  ENABLE_SERVER_PLACES_ENRICHMENT: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  COMMISSION_RATE: z.coerce.number().default(0.05),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  if (process.env.NODE_ENV !== "test") {
    process.exit(1);
  }
}

export const env = parsed.success
  ? parsed.data
  : ({
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://localhost:5432/hiddenstay",
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "dev-access-secret-min-32-characters-long",
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-min-32-characters-long",
      JWT_ACCESS_EXPIRES: "15m",
      JWT_REFRESH_EXPIRES: "7d",
      PORT: 4000,
      NODE_ENV: "development" as const,
      FRONTEND_URL: "http://localhost:3000",
      COMMISSION_RATE: 0.05,
    } as z.infer<typeof envSchema>);
