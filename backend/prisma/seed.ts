import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding HiddenStay AI database...");

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
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

  // Demo properties removed — add listings manually via Business → Properties

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
  console.log("  Owner:    owner@hiddenstay.ai / Password123!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
