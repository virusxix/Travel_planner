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
    description: "List properties, manage rooms, and track bookings",
    role: "BUSINESS_OWNER",
  },
  {
    label: "Admin",
    email: "admin@hiddenstay.ai",
    password: "Admin123!",
    description: "Review listings and manage the platform",
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
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80",
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
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80",
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
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80",
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
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=80",
    tagline: "Wooden Lao house behind the morning market",
  },
];
