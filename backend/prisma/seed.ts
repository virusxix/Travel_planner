import { PrismaClient, type PropertyStatus, type PropertyType, type RoomType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const IMG = {
  homestay:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
  boutique:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
  eco: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
  guesthouse:
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80",
};

function monthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

type DemoProperty = {
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  description: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  image: string;
  avgRating?: number;
  reviewCount?: number;
  rooms: { name: string; roomType: RoomType; capacity: number; basePrice: number; description: string }[];
};

const OWNER_PROPERTIES: DemoProperty[] = [
  {
    name: "Riverside Homestay",
    type: "HOMESTAY",
    status: "APPROVED",
    description:
      "Family-run stay on the Ping River. Lanna breakfast, bicycle rental, and a quiet garden terrace.",
    address: "42 Charoen Rat Road",
    city: "Chiang Mai",
    country: "Thailand",
    lat: 18.7883,
    lng: 98.9853,
    image: IMG.homestay,
    avgRating: 4.8,
    reviewCount: 24,
    rooms: [
      { name: "River View Double", roomType: "DOUBLE", capacity: 2, basePrice: 42, description: "Balcony overlooking the Ping River." },
      { name: "Garden Twin", roomType: "TWIN", capacity: 2, basePrice: 38, description: "Ground floor with garden access." },
    ],
  },
  {
    name: "Lantern Boutique Inn",
    type: "BOUTIQUE_INN",
    status: "APPROVED",
    description: "Restored shophouse with lantern-lit courtyard, five minutes from the old town.",
    address: "18 Nguyen Thai Hoc",
    city: "Hoi An",
    country: "Vietnam",
    lat: 15.877,
    lng: 108.335,
    image: IMG.boutique,
    avgRating: 4.9,
    reviewCount: 31,
    rooms: [
      { name: "Courtyard Suite", roomType: "SUITE", capacity: 2, basePrice: 68, description: "Private courtyard and soaking tub." },
      { name: "Lantern Loft", roomType: "DELUXE", capacity: 2, basePrice: 58, description: "Mezzanine loft with silk lanterns." },
    ],
  },
  {
    name: "Bamboo Eco-Lodge",
    type: "ECO_LODGE",
    status: "PENDING_REVIEW",
    description: "Off-grid bungalows in the Pai valley — solar power, compost toilets, rice-paddy views.",
    address: "Moo 4, Tambon Mae Hi",
    city: "Pai",
    country: "Thailand",
    lat: 19.358,
    lng: 98.441,
    image: IMG.eco,
    rooms: [
      { name: "Bamboo Bungalow", roomType: "DOUBLE", capacity: 2, basePrice: 35, description: "Natural ventilation, outdoor shower." },
    ],
  },
  {
    name: "Temple Street Guesthouse",
    type: "GUESTHOUSE",
    status: "DRAFT",
    description: "Wooden Lao house behind the morning market — draft listing for host onboarding demo.",
    address: "Sakkaline Road",
    city: "Luang Prabang",
    country: "Laos",
    lat: 19.889,
    lng: 102.135,
    image: IMG.guesthouse,
    rooms: [
      { name: "Market View Room", roomType: "SINGLE", capacity: 1, basePrice: 28, description: "Single room with fan and shared bath." },
    ],
  },
];

const HOST2_PROPERTY: DemoProperty = {
  name: "Kyoto Machiya Townhouse",
  type: "BOUTIQUE_INN",
  status: "PENDING_REVIEW",
  description: "Renovated machiya near Gion — tatami rooms, tea ceremony on request.",
  address: "Higashiyama Ward",
  city: "Kyoto",
  country: "Japan",
  lat: 35.0037,
  lng: 135.7788,
  image: IMG.boutique,
  rooms: [
    { name: "Tatami Double", roomType: "DOUBLE", capacity: 2, basePrice: 95, description: "Traditional futon bedding, garden view." },
  ],
};

async function ensureProperty(
  ownerId: string,
  spec: DemoProperty,
  amenityIds: string[]
) {
  let property = await prisma.property.findFirst({
    where: { name: spec.name, ownerId },
    include: { rooms: true },
  });

  if (!property) {
    property = await prisma.property.create({
      data: {
        ownerId,
        name: spec.name,
        type: spec.type,
        status: spec.status,
        description: spec.description,
        address: spec.address,
        city: spec.city,
        country: spec.country,
        latitude: spec.lat,
        longitude: spec.lng,
        contactPhone: "+66-81-234-5678",
        contactEmail: "owner@hiddenstay.ai",
        avgRating: spec.avgRating ?? 0,
        reviewCount: spec.reviewCount ?? 0,
        approvedAt: spec.status === "APPROVED" ? monthsAgo(2) : null,
        images: { create: [{ url: spec.image, sortOrder: 0, caption: spec.name }] },
        amenities: {
          create: amenityIds.slice(0, 4).map((amenityId) => ({ amenityId })),
        },
        rooms: {
          create: spec.rooms.map((r) => ({
            name: r.name,
            roomType: r.roomType,
            capacity: r.capacity,
            basePrice: r.basePrice,
            description: r.description,
            quantity: 2,
            availableCount: 2,
            images: { create: [{ url: spec.image, sortOrder: 0 }] },
          })),
        },
      },
      include: { rooms: true },
    });
  } else {
    property = await prisma.property.update({
      where: { id: property.id },
      data: {
        status: spec.status,
        avgRating: spec.avgRating ?? property.avgRating,
        reviewCount: spec.reviewCount ?? property.reviewCount,
        approvedAt: spec.status === "APPROVED" ? property.approvedAt ?? monthsAgo(2) : null,
      },
      include: { rooms: true },
    });
  }

  return property;
}

async function ensureBooking(
  data: {
    userId: string;
    propertyId: string;
    roomId: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    status: "PENDING" | "CONFIRMED" | "COMPLETED";
    nights: number;
    finalTotal: number;
    platformFee: number;
    createdAt: Date;
    confirmedAt?: Date;
    completedAt?: Date;
  }
) {
  const existing = await prisma.booking.findFirst({
    where: {
      userId: data.userId,
      propertyId: data.propertyId,
      roomId: data.roomId,
      checkIn: data.checkIn,
    },
  });
  if (existing) return existing;

  return prisma.booking.create({
    data: {
      ...data,
      baseTotal: data.finalTotal,
    },
  });
}

async function main() {
  console.log("Seeding HiddenStay AI database...");

  const passwordHash = await bcrypt.hash("Password123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@hiddenstay.ai" },
    update: {},
    create: {
      email: "admin@hiddenstay.ai",
      passwordHash: await bcrypt.hash("Admin123!", 12),
      role: "ADMIN",
      firstName: "Platform",
      lastName: "Admin",
      emailVerified: true,
    },
  });

  const traveler = await prisma.user.upsert({
    where: { email: "traveler@hiddenstay.ai" },
    update: {},
    create: {
      email: "traveler@hiddenstay.ai",
      passwordHash,
      role: "TRAVELER",
      firstName: "Alex",
      lastName: "Wanderer",
      phone: "+1-555-0100",
      emailVerified: true,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@hiddenstay.ai" },
    update: {},
    create: {
      email: "owner@hiddenstay.ai",
      passwordHash,
      role: "BUSINESS_OWNER",
      firstName: "Somsak",
      lastName: "Riverside",
      phone: "+66-81-234-5678",
      emailVerified: true,
      businessProfile: {
        create: {
          businessName: "Riverside Homestays Co.",
          verificationStatus: "APPROVED",
          verifiedAt: new Date(),
        },
      },
    },
  });

  const host2 = await prisma.user.upsert({
    where: { email: "host2@hiddenstay.ai" },
    update: {},
    create: {
      email: "host2@hiddenstay.ai",
      passwordHash,
      role: "BUSINESS_OWNER",
      firstName: "Yuki",
      lastName: "Tanaka",
      phone: "+81-90-1234-5678",
      emailVerified: true,
      businessProfile: {
        create: {
          businessName: "Kyoto Stays KK",
          verificationStatus: "APPROVED",
          verifiedAt: new Date(),
        },
      },
    },
  });

  const amenities = await Promise.all(
    [
      "Free WiFi",
      "Air Conditioning",
      "Breakfast Included",
      "Parking",
      "Pet Friendly",
      "Mountain View",
      "Garden",
      "Bicycle Rental",
      "Airport Shuttle",
      "Eco Certified",
    ].map((name) =>
      prisma.amenity.upsert({
        where: { name },
        update: {},
        create: { name, icon: name.toLowerCase().replace(/\s/g, "-") },
      })
    )
  );

  const amenityIds = amenities.map((a) => a.id);

  const seeded: { name: string; id: string; rooms: { id: string; name: string }[] }[] = [];
  for (const spec of OWNER_PROPERTIES) {
    const p = await ensureProperty(owner.id, spec, amenityIds);
    seeded.push({ name: p.name, id: p.id, rooms: p.rooms.map((r) => ({ id: r.id, name: r.name })) });
  }

  const kyoto = await ensureProperty(host2.id, HOST2_PROPERTY, amenityIds);
  seeded.push({ name: kyoto.name, id: kyoto.id, rooms: kyoto.rooms.map((r) => ({ id: r.id, name: r.name })) });

  const riverside = seeded.find((p) => p.name === "Riverside Homestay")!;
  const lantern = seeded.find((p) => p.name === "Lantern Boutique Inn")!;

  await ensureBooking({
    userId: traveler.id,
    propertyId: riverside.id,
    roomId: riverside.rooms[0].id,
    checkIn: daysFromNow(14),
    checkOut: daysFromNow(17),
    guests: 2,
    status: "PENDING",
    nights: 3,
    finalTotal: 126,
    platformFee: 12.6,
    createdAt: new Date(),
  });

  await ensureBooking({
    userId: traveler.id,
    propertyId: riverside.id,
    roomId: riverside.rooms[1].id,
    checkIn: daysFromNow(5),
    checkOut: daysFromNow(8),
    guests: 2,
    status: "CONFIRMED",
    nights: 3,
    finalTotal: 114,
    platformFee: 11.4,
    createdAt: monthsAgo(1),
    confirmedAt: monthsAgo(1),
  });

  await ensureBooking({
    userId: traveler.id,
    propertyId: lantern.id,
    roomId: lantern.rooms[0].id,
    checkIn: (() => {
      const d = monthsAgo(2);
      d.setDate(d.getDate() - 10);
      return d;
    })(),
    checkOut: (() => {
      const d = monthsAgo(2);
      d.setDate(d.getDate() - 6);
      return d;
    })(),
    guests: 2,
    status: "COMPLETED",
    nights: 4,
    finalTotal: 272,
    platformFee: 27.2,
    createdAt: monthsAgo(3),
    confirmedAt: monthsAgo(3),
    completedAt: monthsAgo(2),
  });

  await ensureBooking({
    userId: traveler.id,
    propertyId: lantern.id,
    roomId: lantern.rooms[1].id,
    checkIn: (() => {
      const d = monthsAgo(1);
      d.setDate(d.getDate() - 8);
      return d;
    })(),
    checkOut: (() => {
      const d = monthsAgo(1);
      d.setDate(d.getDate() - 6);
      return d;
    })(),
    guests: 2,
    status: "COMPLETED",
    nights: 2,
    finalTotal: 116,
    platformFee: 11.6,
    createdAt: monthsAgo(2),
    confirmedAt: monthsAgo(2),
    completedAt: monthsAgo(1),
  });

  const reviewExists = await prisma.review.findFirst({
    where: { userId: traveler.id, propertyId: riverside.id },
  });
  if (!reviewExists) {
    await prisma.review.create({
      data: {
        userId: traveler.id,
        propertyId: riverside.id,
        rating: 5,
        title: "Perfect riverside stay",
        content: "Warm hosts, incredible breakfast, and bikes to explore the old city.",
      },
    });
  }

  const gems = [
    {
      name: "Warorot Morning Market",
      category: "EXPERIENCE" as const,
      city: "Chiang Mai",
      country: "Thailand",
      lat: 18.7902,
      lng: 98.986,
      desc: "Locals' market for northern Thai breakfast — khao soi, sai ua, fresh fruit.",
      tags: ["food", "local", "morning"],
    },
    {
      name: "Baan Kang Wat Artist Village",
      category: "CULTURAL_SITE" as const,
      city: "Chiang Mai",
      country: "Thailand",
      lat: 18.76,
      lng: 98.95,
      desc: "Community of artisans in converted wooden houses — workshops and cafes.",
      tags: ["art", "hidden"],
    },
    {
      name: "Secret Waterfall Pai",
      category: "ATTRACTION" as const,
      city: "Pai",
      country: "Thailand",
      lat: 19.4,
      lng: 98.45,
      desc: "Short hike to a swimming hole locals visit on weekdays.",
      tags: ["nature", "swim"],
    },
    {
      name: "Mrs Ly's Kitchen",
      category: "RESTAURANT" as const,
      city: "Hoi An",
      country: "Vietnam",
      lat: 15.877,
      lng: 108.335,
      desc: "Family recipes — cao lau and white rose dumplings without tourist markup.",
      tags: ["food", "authentic"],
    },
  ];

  for (const g of gems) {
    const exists = await prisma.hiddenGem.findFirst({ where: { name: g.name } });
    if (!exists) {
      await prisma.hiddenGem.create({
        data: {
          name: g.name,
          description: g.desc,
          category: g.category,
          city: g.city,
          country: g.country,
          latitude: g.lat,
          longitude: g.lng,
          tags: g.tags,
          rating: 4.5 + Math.random() * 0.4,
          isFeatured: true,
          imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600",
        },
      });
    }
  }

  console.log("Seed complete!");
  console.log("Demo accounts:");
  console.log("  Admin:    admin@hiddenstay.ai / Admin123!");
  console.log("  Traveler: traveler@hiddenstay.ai / Password123!");
  console.log("  Host:     owner@hiddenstay.ai / Password123!");
  console.log("  Host 2:   host2@hiddenstay.ai / Password123!");
  console.log("");
  console.log("Host demo: 2 approved listings, 1 draft, 1 pending + bookings & charts");
  console.log("Admin demo: 2 pending approvals (Bamboo Eco-Lodge, Kyoto Machiya)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
