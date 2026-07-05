import { UNSPLASH } from "@/lib/unsplash-images";
import type { Booking, Property } from "@/types";

export const DEMO_HOST_PROPERTIES: Property[] = [
  {
    id: "demo-riverside",
    name: "Riverside Homestay",
    type: "HOMESTAY",
    status: "APPROVED",
    description: "Family-run stay on the Ping River with Lanna breakfast.",
    address: "42 Charoen Rat Road",
    city: "Chiang Mai",
    country: "Thailand",
    latitude: 18.7883,
    longitude: 98.9853,
    contactPhone: "+66-81-234-5678",
    contactEmail: "owner@hiddenstay.ai",
    avgRating: 4.8,
    reviewCount: 24,
    images: [{ url: UNSPLASH.stays.homestay }],
    rooms: [
      { id: "demo-r1", name: "River View Double", roomType: "DOUBLE", capacity: 2, basePrice: 42, description: "Balcony overlooking the river.", quantity: 2, availableCount: 2 },
      { id: "demo-r2", name: "Garden Twin", roomType: "TWIN", capacity: 2, basePrice: 38, description: "Ground floor garden access.", quantity: 2, availableCount: 2 },
    ],
  },
  {
    id: "demo-lantern",
    name: "Lantern Boutique Inn",
    type: "BOUTIQUE_INN",
    status: "APPROVED",
    description: "Lantern-lit courtyard steps from Hoi An old town.",
    address: "18 Nguyen Thai Hoc",
    city: "Hoi An",
    country: "Vietnam",
    latitude: 15.877,
    longitude: 108.335,
    contactPhone: "+84-235-123-456",
    contactEmail: "owner@hiddenstay.ai",
    avgRating: 4.9,
    reviewCount: 31,
    images: [{ url: UNSPLASH.stays.boutique }],
    rooms: [
      { id: "demo-r3", name: "Courtyard Suite", roomType: "SUITE", capacity: 2, basePrice: 68, description: "Private courtyard.", quantity: 2, availableCount: 1 },
    ],
  },
  {
    id: "demo-bamboo",
    name: "Bamboo Eco-Lodge",
    type: "ECO_LODGE",
    status: "PENDING_REVIEW",
    description: "Off-grid bungalows in the Pai valley.",
    address: "Moo 4, Mae Hi",
    city: "Pai",
    country: "Thailand",
    latitude: 19.358,
    longitude: 98.441,
    contactPhone: "+66-81-234-5678",
    contactEmail: "owner@hiddenstay.ai",
    avgRating: 0,
    reviewCount: 0,
    images: [{ url: UNSPLASH.stays.ecoLodge }],
    rooms: [
      { id: "demo-r4", name: "Bamboo Bungalow", roomType: "DOUBLE", capacity: 2, basePrice: 35, description: "Outdoor shower.", quantity: 2, availableCount: 2 },
    ],
  },
  {
    id: "demo-temple",
    name: "Temple Street Guesthouse",
    type: "GUESTHOUSE",
    status: "DRAFT",
    description: "Wooden Lao house behind the morning market.",
    address: "Sakkaline Road",
    city: "Luang Prabang",
    country: "Laos",
    latitude: 19.889,
    longitude: 102.135,
    contactPhone: "+856-71-123-456",
    contactEmail: "owner@hiddenstay.ai",
    avgRating: 0,
    reviewCount: 0,
    images: [{ url: UNSPLASH.stays.guesthouse }],
    rooms: [
      { id: "demo-r5", name: "Market View Room", roomType: "SINGLE", capacity: 1, basePrice: 28, description: "Fan room.", quantity: 2, availableCount: 2 },
    ],
  },
];

export const DEMO_HOST_BOOKINGS: Booking[] = [
  {
    id: "demo-b1",
    checkIn: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    checkOut: new Date(Date.now() + 17 * 86400000).toISOString().slice(0, 10),
    status: "PENDING",
    nights: 3,
    finalTotal: 126,
    guests: 2,
    property: { ...DEMO_HOST_PROPERTIES[0], images: DEMO_HOST_PROPERTIES[0].images },
  },
  {
    id: "demo-b2",
    checkIn: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    checkOut: new Date(Date.now() + 8 * 86400000).toISOString().slice(0, 10),
    status: "CONFIRMED",
    nights: 3,
    finalTotal: 114,
    guests: 2,
    property: { ...DEMO_HOST_PROPERTIES[0], images: DEMO_HOST_PROPERTIES[0].images },
  },
  {
    id: "demo-b3",
    checkIn: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    checkOut: new Date(Date.now() - 26 * 86400000).toISOString().slice(0, 10),
    status: "COMPLETED",
    nights: 4,
    finalTotal: 272,
    guests: 2,
    property: { ...DEMO_HOST_PROPERTIES[1], images: DEMO_HOST_PROPERTIES[1].images },
  },
];

export const DEMO_HOST_ANALYTICS = {
  revenue: 502,
  totalBookings: 3,
  occupancyRate: 68.5,
  pendingBookings: 1,
  bookingTrends: [
    { month: "2026-04", count: 2 },
    { month: "2026-05", count: 4 },
    { month: "2026-06", count: 3 },
    { month: "2026-07", count: 5 },
  ],
  popularRoomTypes: [
    { type: "DOUBLE", count: 4 },
    { type: "SUITE", count: 2 },
    { type: "TWIN", count: 1 },
  ],
};

export function useHostDemo(
  properties: Property[] | undefined | null,
  opts?: { isFetched?: boolean; isError?: boolean }
) {
  if (opts && !opts.isFetched && !opts.isError) return false;
  return !!opts?.isError || !properties?.length;
}
