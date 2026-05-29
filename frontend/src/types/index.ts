export type UserRole = "TRAVELER" | "BUSINESS_OWNER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
}

export interface Property {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  contactEmail: string;
  avgRating: number;
  reviewCount: number;
  images?: { id?: string; url: string; caption?: string }[];
  amenities?: { amenity: { id: string; name: string } }[];
  rooms?: Room[];
}

export interface Room {
  id: string;
  name: string;
  roomType: string;
  capacity: number;
  basePrice: number | string;
  description: string;
  quantity: number;
  availableCount: number;
  images?: { url: string }[];
}

export interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  nights: number;
  finalTotal: number | string;
  guests: number;
  paymentExpiresAt?: string | null;
  property?: Property & { images?: { url: string }[] };
  room?: Room;
}

export interface HiddenGem {
  id: string;
  name: string;
  description: string;
  category: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  rating: number;
  tags: string[];
}

export interface Itinerary {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number | string;
  totalCost?: number | string;
  summary?: string;
  days?: ItineraryDay[];
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  description?: string;
  activities?: {
    id: string;
    time?: string;
    title: string;
    description?: string;
    location?: string;
    cost?: number | string;
    category?: string;
    latitude?: number | null;
    longitude?: number | null;
    imageUrl?: string | null;
    placeId?: string | null;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: { code: string; message: string };
}
