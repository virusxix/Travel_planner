import type { Booking } from "@/types";

export const COMMISSION_RATE = 0.05;

const amount = (v: number | string) => Number(v) || 0;

export function platformFee(finalTotal: number | string): number {
  return amount(finalTotal) * COMMISSION_RATE;
}

export function hostEarnings(finalTotal: number | string): number {
  return amount(finalTotal) * (1 - COMMISSION_RATE);
}

export interface EarningsSummary {
  available: number;
  pending: number;
  lifetime: number;
  grossVolume: number;
}

export function summarizeEarnings(bookings: Booking[]): EarningsSummary {
  let available = 0;
  let pending = 0;
  let grossVolume = 0;

  for (const b of bookings) {
    if (b.status === "COMPLETED") {
      available += hostEarnings(b.finalTotal);
      grossVolume += amount(b.finalTotal);
    } else if (b.status === "CONFIRMED") {
      pending += hostEarnings(b.finalTotal);
      grossVolume += amount(b.finalTotal);
    }
  }

  return { available, pending, lifetime: available + pending, grossVolume };
}
