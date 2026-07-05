import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const owner = await prisma.user.findUnique({
    where: { email: "owner@hiddenstay.ai" },
    include: {
      properties: { include: { rooms: true } },
      businessProfile: true,
    },
  });
  console.log("owner:", owner?.id, owner?.email);
  console.log("properties:", owner?.properties.length ?? 0);
  for (const p of owner?.properties ?? []) {
    console.log(`  ${p.name} (${p.status}) — ${p.rooms.length} rooms`);
  }
  const bookings = await prisma.booking.count({
    where: { property: { owner: { email: "owner@hiddenstay.ai" } } },
  });
  console.log("bookings:", bookings);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
