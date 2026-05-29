import { prisma } from "../lib/prisma.js";

export async function getOwnerAnalytics(ownerId: string) {
  const properties = await prisma.property.findMany({
    where: { ownerId },
    select: { id: true },
  });
  const propertyIds = properties.map((p) => p.id);

  const bookings = await prisma.booking.findMany({
    where: { propertyId: { in: propertyIds }, status: { in: ["CONFIRMED", "COMPLETED"] } },
    include: { room: true },
  });

  const revenue = bookings.reduce((sum, b) => sum + Number(b.finalTotal), 0);
  const totalNights = bookings.reduce((sum, b) => sum + b.nights, 0);

  const rooms = await prisma.room.findMany({ where: { propertyId: { in: propertyIds } } });
  const totalCapacity = rooms.reduce((s, r) => s + r.quantity, 0) || 1;
  const occupancyRate = Math.min((bookings.length / (totalCapacity * 30)) * 100, 100);

  const byMonth: Record<string, number> = {};
  bookings.forEach((b) => {
    const key = b.createdAt.toISOString().slice(0, 7);
    byMonth[key] = (byMonth[key] ?? 0) + 1;
  });

  const roomTypeCount: Record<string, number> = {};
  bookings.forEach((b) => {
    const t = b.room.roomType;
    roomTypeCount[t] = (roomTypeCount[t] ?? 0) + 1;
  });

  return {
    revenue: Math.round(revenue * 100) / 100,
    totalBookings: bookings.length,
    occupancyRate: Math.round(occupancyRate * 10) / 10,
    totalNights,
    bookingTrends: Object.entries(byMonth).map(([month, count]) => ({ month, count })),
    popularRoomTypes: Object.entries(roomTypeCount).map(([type, count]) => ({ type, count })),
    pendingBookings: await prisma.booking.count({
      where: { propertyId: { in: propertyIds }, status: "PENDING" },
    }),
  };
}

export async function getAdminAnalytics() {
  const [totalUsers, totalProperties, totalBookings, revenueAgg, pendingProperties] =
    await Promise.all([
      prisma.user.count(),
      prisma.property.count({ where: { status: "APPROVED" } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
        _sum: { platformFee: true, finalTotal: true },
      }),
      prisma.property.count({ where: { status: "PENDING_REVIEW" } }),
    ]);

  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  });

  const bookingsByStatus = await prisma.booking.groupBy({
    by: ["status"],
    _count: true,
  });

  return {
    totalUsers,
    totalProperties,
    totalBookings,
    pendingProperties,
    totalRevenue: Number(revenueAgg._sum.finalTotal ?? 0),
    platformRevenue: Number(revenueAgg._sum.platformFee ?? 0),
    usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count })),
    bookingsByStatus: bookingsByStatus.map((b) => ({ status: b.status, count: b._count })),
  };
}
