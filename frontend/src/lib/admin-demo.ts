import { UNSPLASH } from "@/lib/unsplash-images";
import type { Property } from "@/types";

export const DEMO_ADMIN_ANALYTICS = {
  totalUsers: 12,
  totalProperties: 8,
  totalBookings: 24,
  pendingProperties: 2,
  totalRevenue: 4820,
  platformRevenue: 482,
  usersByRole: [
    { role: "TRAVELER", count: 8 },
    { role: "BUSINESS_OWNER", count: 3 },
    { role: "ADMIN", count: 1 },
  ],
  bookingsByStatus: [
    { status: "CONFIRMED", count: 10 },
    { status: "COMPLETED", count: 9 },
    { status: "PENDING", count: 3 },
    { status: "CANCELLED", count: 2 },
  ],
};

export const DEMO_ADMIN_PENDING: Property[] = [
  {
    id: "demo-pending-bamboo",
    name: "Bamboo Eco-Lodge",
    type: "ECO_LODGE",
    status: "PENDING_REVIEW",
    description: "Off-grid bungalows in the Pai valley — solar power and rice-paddy views.",
    address: "Moo 4, Tambon Mae Hi",
    city: "Pai",
    country: "Thailand",
    latitude: 19.358,
    longitude: 98.441,
    contactPhone: "+66-81-234-5678",
    contactEmail: "owner@hiddenstay.ai",
    avgRating: 0,
    reviewCount: 0,
    images: [{ url: UNSPLASH.stays.ecoLodge }],
  },
  {
    id: "demo-pending-kyoto",
    name: "Kyoto Machiya Townhouse",
    type: "BOUTIQUE_INN",
    status: "PENDING_REVIEW",
    description: "Renovated machiya near Gion with tatami rooms.",
    address: "Higashiyama Ward",
    city: "Kyoto",
    country: "Japan",
    latitude: 35.0037,
    longitude: 135.7788,
    contactPhone: "+81-90-1234-5678",
    contactEmail: "host2@hiddenstay.ai",
    avgRating: 0,
    reviewCount: 0,
    images: [{ url: UNSPLASH.stays.boutique }],
  },
];

export const DEMO_ADMIN_USERS = [
  { id: "demo-u1", email: "traveler@hiddenstay.ai", role: "TRAVELER", firstName: "Alex", lastName: "Wanderer", isActive: true },
  { id: "demo-u2", email: "owner@hiddenstay.ai", role: "BUSINESS_OWNER", firstName: "Somsak", lastName: "Riverside", isActive: true },
  { id: "demo-u3", email: "host2@hiddenstay.ai", role: "BUSINESS_OWNER", firstName: "Yuki", lastName: "Tanaka", isActive: true },
  { id: "demo-u4", email: "admin@hiddenstay.ai", role: "ADMIN", firstName: "Platform", lastName: "Admin", isActive: true },
  { id: "demo-u5", email: "guest@example.com", role: "TRAVELER", firstName: "Jamie", lastName: "Lee", isActive: false },
];

export function useAdminDemo<T>(
  data: T[] | undefined | null,
  opts?: { isFetched?: boolean; isError?: boolean }
) {
  if (opts && !opts.isFetched && !opts.isError) return false;
  return !!opts?.isError || !data?.length;
}
