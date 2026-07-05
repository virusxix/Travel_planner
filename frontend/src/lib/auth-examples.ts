import { UNSPLASH } from "@/lib/unsplash-images";

export interface DemoAccount {
  label: string;
  email: string;
  password: string;
  description: string;
  role: "TRAVELER" | "BUSINESS_OWNER" | "ADMIN";
}

export interface AuthExampleStay {
  id: string;
  name: string;
  city: string;
  country: string;
  type: string;
  price: number;
  rating: number;
  image: string;
  tagline: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Traveler",
    email: "traveler@hiddenstay.ai",
    password: "Password123!",
    description: "Browse stays, save favorites, and plan AI trips",
    role: "TRAVELER",
  },
  {
    label: "Host",
    email: "owner@hiddenstay.ai",
    password: "Password123!",
    description: "4 sample listings, bookings, and revenue charts — shows even without a database",
    role: "BUSINESS_OWNER",
  },
  {
    label: "Admin",
    email: "admin@hiddenstay.ai",
    password: "Admin123!",
    description: "Sample approvals, users, and platform analytics — shows even without a database",
    role: "ADMIN",
  },
];

export const AUTH_EXAMPLE_STAYS: AuthExampleStay[] = [
  {
    id: "example-chiang-mai",
    name: "Riverside Homestay",
    city: "Chiang Mai",
    country: "Thailand",
    type: "Homestay",
    price: 42,
    rating: 4.8,
    image: UNSPLASH.stays.homestay,
    tagline: "Family-run stay on the Ping River with Lanna breakfast",
  },
  {
    id: "example-hoi-an",
    name: "Lantern Boutique Inn",
    city: "Hoi An",
    country: "Vietnam",
    type: "Boutique inn",
    price: 58,
    rating: 4.9,
    image: UNSPLASH.stays.boutique,
    tagline: "Lantern-lit courtyard steps from artisan quarters",
  },
  {
    id: "example-pai",
    name: "Bamboo Eco-Lodge",
    city: "Pai",
    country: "Thailand",
    type: "Eco lodge",
    price: 35,
    rating: 4.7,
    image: UNSPLASH.stays.ecoLodge,
    tagline: "Off-grid bungalows surrounded by rice paddies",
  },
  {
    id: "example-luang-prabang",
    name: "Temple Street Homestay",
    city: "Luang Prabang",
    country: "Laos",
    type: "Homestay",
    price: 38,
    rating: 4.6,
    image: UNSPLASH.stays.guesthouse,
    tagline: "Wooden Lao house behind the morning market",
  },
];
