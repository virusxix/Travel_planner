import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { optionalAuth } from "./middleware/auth.js";

import authRoutes from "./routes/auth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import roomRoutes from "./routes/room.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import itineraryRoutes from "./routes/itinerary.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import miscRoutes from "./routes/misc.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import favoritesRoutes from "./routes/favorites.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import stripeWebhookRoutes from "./routes/stripe.webhook.routes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

// Stripe webhooks require the raw body (must be before express.json)
app.use(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookRoutes
);

app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use(optionalAuth);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", service: "HiddenStay AI API" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", miscRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`HiddenStay API running on http://localhost:${env.PORT}`);
});

export default app;
