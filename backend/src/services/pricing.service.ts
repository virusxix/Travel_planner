import { Prisma, SeasonType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const DEFAULT_SEASONAL: Record<string, number> = {
  PEAK: 1.35,
  OFF_SEASON: 0.85,
  WEEKEND: 1.2,
  HOLIDAY: 1.5,
};

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isInRange(date: Date, start?: Date | null, end?: Date | null): boolean {
  if (!start || !end) return false;
  return date >= start && date <= end;
}

export async function getOccupancyRate(roomId: string, date: Date): Promise<number> {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room || room.quantity === 0) return 0;

  const booked = await prisma.booking.count({
    where: {
      roomId,
      status: { in: ["PENDING", "CONFIRMED"] },
      checkIn: { lte: date },
      checkOut: { gt: date },
    },
  });

  return Math.min(booked / room.quantity, 1);
}

export function occupancyMultiplier(rate: number): number {
  if (rate >= 0.9) return 1.25;
  if (rate >= 0.7) return 1.15;
  if (rate >= 0.5) return 1.05;
  if (rate <= 0.2) return 0.9;
  return 1;
}

export async function getSeasonalMultiplier(
  roomId: string,
  date: Date
): Promise<number> {
  const rules = await prisma.seasonalPrice.findMany({ where: { roomId } });

  for (const rule of rules) {
    if (isInRange(date, rule.startDate, rule.endDate)) {
      return Number(rule.multiplier);
    }
  }

  if (rules.some((r) => r.seasonType === "HOLIDAY" && isInRange(date, r.startDate, r.endDate))) {
    return DEFAULT_SEASONAL.HOLIDAY;
  }

  const weekendRule = rules.find((r) => r.seasonType === "WEEKEND");
  if (weekendRule && isWeekend(date)) {
    return Number(weekendRule.multiplier);
  }

  const peakRule = rules.find((r) => r.seasonType === "PEAK");
  const offRule = rules.find((r) => r.seasonType === "OFF_SEASON");

  if (peakRule && !offRule) return Number(peakRule.multiplier);
  if (offRule && !isWeekend(date)) return Number(offRule.multiplier);

  if (isWeekend(date)) return DEFAULT_SEASONAL.WEEKEND;
  return 1;
}

export async function calculateNightlyPrice(roomId: string, date: Date): Promise<{
  basePrice: number;
  seasonalMultiplier: number;
  occupancyMultiplier: number;
  finalPrice: number;
}> {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error("Room not found");

  const basePrice = Number(room.basePrice);
  const seasonalMultiplier = await getSeasonalMultiplier(roomId, date);
  const occupancyRate = await getOccupancyRate(roomId, date);
  const occMultiplier = occupancyMultiplier(occupancyRate);
  const finalPrice = Math.round(basePrice * seasonalMultiplier * occMultiplier * 100) / 100;

  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const availability = await prisma.roomAvailability.findUnique({
    where: { roomId_date: { roomId, date: day } },
  });
  if (availability?.available === 0) {
    throw new Error("Room not available for this date");
  }

  return {
    basePrice,
    seasonalMultiplier,
    occupancyMultiplier: occMultiplier,
    finalPrice,
  };
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function calculateBookingTotal(
  roomId: string,
  checkIn: Date,
  checkOut: Date
): Promise<{ nights: number; nightlyBreakdown: Array<{ date: string; price: number }>; total: number }> {
  if (checkOut <= checkIn) {
    throw new Error("Check-out must be after check-in");
  }

  const nights: Array<{ date: string; price: number }> = [];
  let total = 0;
  let current = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const end = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());

  while (current < end) {
    const { finalPrice } = await calculateNightlyPrice(roomId, current);
    nights.push({ date: formatDateKey(current), price: finalPrice });
    total += finalPrice;
    current = addDays(current, 1);
  }

  return {
    nights: nights.length,
    nightlyBreakdown: nights,
    total: Math.round(total * 100) / 100,
  };
}

export function platformFee(subtotal: number, rate = 0.05): number {
  return Math.round(subtotal * rate * 100) / 100;
}
