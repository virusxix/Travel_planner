import { HiddenGemCategory } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function recommendHiddenGems(params: {
  city?: string;
  country?: string;
  category?: HiddenGemCategory;
  lat?: number;
  lng?: number;
  limit?: number;
}) {
  const limit = params.limit ?? 12;

  const where: Record<string, unknown> = {};
  if (params.city) where.city = { contains: params.city, mode: "insensitive" };
  if (params.country) where.country = { contains: params.country, mode: "insensitive" };
  if (params.category) where.category = params.category;

  let gems = await prisma.hiddenGem.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
    take: limit * 2,
  });

  if (params.lat != null && params.lng != null) {
    gems = gems
      .map((g) => ({
        ...g,
        distance: haversineKm(params.lat!, params.lng!, g.latitude, g.longitude),
      }))
      .sort((a, b) => (a as { distance: number }).distance - (b as { distance: number }).distance);
  }

  return gems.slice(0, limit);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getPropertyRecommendations(city: string, country: string, limit = 6) {
  return prisma.property.findMany({
    where: { city, country, status: "APPROVED" },
    orderBy: [{ avgRating: "desc" }, { reviewCount: "desc" }],
    take: limit,
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
      rooms: { take: 1, orderBy: { basePrice: "asc" } },
    },
  });
}
