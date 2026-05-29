import { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { calculateBookingTotal, platformFee } from "./pricing.service.js";
import { env } from "../config/env.js";

const PAYMENT_HOLD_MINUTES = 30;

export function getPaymentExpiryDate(): Date {
  return new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60 * 1000);
}

/** Cancel pending bookings past payment deadline and release holds. */
export async function releaseExpiredBookings(): Promise<number> {
  const now = new Date();
  const expired = await prisma.booking.findMany({
    where: {
      status: "PENDING",
      paymentExpiresAt: { lt: now },
    },
  });

  if (expired.length === 0) return 0;

  await prisma.booking.updateMany({
    where: { id: { in: expired.map((b) => b.id) } },
    data: { status: "CANCELLED", cancelledAt: now },
  });

  return expired.length;
}

function activeBookingWhere(
  roomId: string,
  checkIn: Date,
  checkOut: Date
): Prisma.BookingWhereInput {
  const now = new Date();
  return {
    roomId,
    checkIn: { lt: checkOut },
    checkOut: { gt: checkIn },
    OR: [
      { status: "CONFIRMED" },
      {
        status: "PENDING",
        OR: [{ paymentExpiresAt: null }, { paymentExpiresAt: { gt: now } }],
      },
    ],
  };
}

export async function countActiveReservations(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
): Promise<number> {
  await releaseExpiredBookings();
  return prisma.booking.count({
    where: {
      ...activeBookingWhere(roomId, checkIn, checkOut),
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
  });
}

export async function checkAvailability(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  roomsNeeded = 1
): Promise<boolean> {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return false;

  const reserved = await countActiveReservations(roomId, checkIn, checkOut);
  return room.quantity - reserved >= roomsNeeded;
}

export async function getRoomOccupancyStats(roomId: string) {
  await releaseExpiredBookings();
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error("Room not found");

  const now = new Date();
  const activePending = await prisma.booking.count({
    where: {
      roomId,
      status: "PENDING",
      OR: [{ paymentExpiresAt: null }, { paymentExpiresAt: { gt: now } }],
    },
  });
  const confirmed = await prisma.booking.count({
    where: { roomId, status: "CONFIRMED" },
  });
  const booked = activePending + confirmed;
  const available = Math.max(0, room.quantity - booked);
  const occupancyPercent =
    room.quantity > 0 ? Math.round((booked / room.quantity) * 100) : 0;

  return {
    roomId,
    totalRooms: room.quantity,
    availableRooms: available,
    bookedRooms: booked,
    pendingPayment: activePending,
    confirmedBookings: confirmed,
    occupancyPercent,
  };
}

export async function createBooking(data: {
  userId: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
}) {
  await releaseExpiredBookings();

  const room = await prisma.room.findUnique({
    where: { id: data.roomId },
    include: { property: true },
  });
  if (!room) throw new Error("Room not found");
  if (room.property.status !== "APPROVED") {
    throw new Error("Property not available for booking");
  }

  const available = await checkAvailability(data.roomId, data.checkIn, data.checkOut);
  if (!available) throw new Error("Room not available for selected dates");

  const { nights, total } = await calculateBookingTotal(data.roomId, data.checkIn, data.checkOut);
  const fee = platformFee(total, env.COMMISSION_RATE);

  const booking = await prisma.booking.create({
    data: {
      userId: data.userId,
      propertyId: room.propertyId,
      roomId: data.roomId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests: data.guests,
      nights,
      baseTotal: total,
      finalTotal: total,
      platformFee: fee,
      status: "PENDING",
      paymentExpiresAt: getPaymentExpiryDate(),
    },
    include: {
      room: { include: { images: true } },
      property: { include: { images: { take: 1 } } },
    },
  });

  return booking;
}

/** Confirm after successful payment — reduces available inventory. */
export async function confirmBookingPayment(bookingId: string, userId: string) {
  await releaseExpiredBookings();

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { property: true, room: true },
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "CONFIRMED") return booking;
  if (booking.status !== "PENDING") throw new Error("Booking cannot be confirmed");

  if (booking.paymentExpiresAt && booking.paymentExpiresAt < new Date()) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    throw new Error("Payment window expired — please book again");
  }

  const stillAvailable = await checkAvailability(
    booking.roomId,
    booking.checkIn,
    booking.checkOut,
    1
  );
  if (!stillAvailable) throw new Error("Room no longer available");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
        paymentExpiresAt: null,
      },
      include: {
        room: { include: { images: true } },
        property: { include: { images: { take: 1 } } },
      },
    });

    await tx.room.update({
      where: { id: booking.roomId },
      data: { availableCount: { decrement: 1 } },
    });

    return updated;
  });
}

export async function confirmBooking(bookingId: string, ownerId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: true },
  });
  if (!booking || booking.property.ownerId !== ownerId) {
    throw new Error("Booking not found or unauthorized");
  }
  if (booking.status === "CONFIRMED") return booking;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
        paymentExpiresAt: null,
      },
    });

    if (booking.status === "PENDING") {
      await tx.room.update({
        where: { id: booking.roomId },
        data: { availableCount: { decrement: 1 } },
      });
    }

    return updated;
  });
}

export async function cancelBooking(bookingId: string, userId: string, isOwner: boolean) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: true },
  });
  if (!booking) throw new Error("Booking not found");

  if (!isOwner && booking.userId !== userId) throw new Error("Unauthorized");
  if (isOwner && booking.property.ownerId !== userId) throw new Error("Unauthorized");

  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    throw new Error("Cannot cancel this booking");
  }

  const wasConfirmed = booking.status === "CONFIRMED";

  return prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", cancelledAt: new Date(), paymentExpiresAt: null },
    });

    if (wasConfirmed) {
      await tx.room.update({
        where: { id: booking.roomId },
        data: { availableCount: { increment: 1 } },
      });
    }

    return updated;
  });
}

export async function completeBooking(bookingId: string) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
}
