import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const properties = await prisma.property.count({ where: { status: "APPROVED" } });
  console.log(`Connected! Users: ${users}, Approved properties: ${properties}`);
}

main()
  .catch((e) => {
    console.error("Connection failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
