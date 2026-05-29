import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["TRAVELER", "BUSINESS_OWNER"]).default("TRAVELER"),
  phone: z.string().optional(),
  businessName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const propertySchema = z.object({
  name: z.string().min(2),
  type: z.enum(["HOTEL", "MOTEL", "GUESTHOUSE", "HOMESTAY", "BOUTIQUE_INN", "ECO_LODGE"]),
  description: z.string().min(20),
  address: z.string().min(5),
  city: z.string().min(2),
  country: z.string().min(2),
  latitude: z.number(),
  longitude: z.number(),
  contactPhone: z.string().min(5),
  contactEmail: z.string().email(),
  amenityIds: z.array(z.string().uuid()).optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

export const roomSchema = z.object({
  name: z.string().min(1),
  roomType: z.enum(["SINGLE", "DOUBLE", "TWIN", "TRIPLE", "FAMILY", "DORM", "SUITE", "DELUXE"]),
  capacity: z.number().int().positive(),
  basePrice: z.number().positive(),
  description: z.string().min(10),
  quantity: z.number().int().positive().default(1),
  imageUrls: z.array(z.string().url()).optional(),
});

export const bookingSchema = z
  .object({
    roomId: z.string().min(1),
    checkIn: z.string().min(1),
    checkOut: z.string().min(1),
    guests: z.number().int().positive().default(1),
  })
  .superRefine((data, ctx) => {
    const inDate = parseBookingDate(data.checkIn);
    const outDate = parseBookingDate(data.checkOut);
    if (!inDate) {
      ctx.addIssue({ code: "custom", message: "Invalid check-in date", path: ["checkIn"] });
      return;
    }
    if (!outDate) {
      ctx.addIssue({ code: "custom", message: "Invalid check-out date", path: ["checkOut"] });
      return;
    }
    if (outDate <= inDate) {
      ctx.addIssue({
        code: "custom",
        message: "Check-out must be after check-in",
        path: ["checkOut"],
      });
    }
  });

/** Parse YYYY-MM-DD without timezone shift */
export function parseBookingDate(value: string): Date | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const d = parseInt(m[3], 10);
  const date = new Date(y, mo, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo || date.getDate() !== d) return null;
  return date;
}

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(10),
  imageUrls: z.array(z.string().url()).optional(),
});

export const itinerarySchema = z.object({
  destination: z.string().min(2),
  country: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  travelers: z.number().int().positive(),
  budget: z.number().positive(),
  interests: z.array(z.string()).default([]),
});

export const verifyPropertySchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]),
  adminNotes: z.string().optional(),
});

export const seasonalPriceSchema = z.object({
  seasonType: z.enum(["PEAK", "OFF_SEASON", "WEEKEND", "HOLIDAY"]),
  multiplier: z.number().positive(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
