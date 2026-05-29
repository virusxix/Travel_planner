import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PROPERTY_NAMES = [
  "Riverside Homestay Chiang Mai",
  "Bamboo Eco-Lodge Pai",
  "Lantern Boutique Inn Hoi An",
  "Harbour Guesthouse George Town",
  "Volcano View Motel Tagaytay",
  "Temple Street Homestay Luang Prabang",
  "Sunrise Motel Bagan (Pending)",
];

async function main() {
  const found = await prisma.property.findMany({
    where: { name: { in: DEMO_PROPERTY_NAMES } },
    select: { id: true, name: true },
  });

  if (!found.length) {
    console.log("No demo properties in database.");
    return;
  }

  console.log("Removing demo properties:");
  for (const p of found) console.log(" -", p.name);

  const ids = found.map((p) => p.id);

  await prisma.review.deleteMany({ where: { propertyId: { in: ids } } });
  await prisma.booking.deleteMany({ where: { propertyId: { in: ids } } });

  const result = await prisma.property.deleteMany({
    where: { id: { in: ids } },
  });

  console.log(`Deleted ${result.count} properties.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
