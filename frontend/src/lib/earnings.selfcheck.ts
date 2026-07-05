/**
 * Runnable self-check for the earnings/fee computation logic.
 * No test framework — run with: npx tsx src/lib/earnings.selfcheck.ts
 */
import assert from "node:assert/strict";
import type { Booking } from "@/types";
import { COMMISSION_RATE, hostEarnings, platformFee, summarizeEarnings } from "./earnings";

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

assert.equal(COMMISSION_RATE, 0.05, "commission is 5%");

// Fee split always reconstructs the gross total.
assert.ok(near(platformFee(100), 5), "5% of 100 is 5");
assert.ok(near(hostEarnings(100), 95), "host keeps 95 of 100");
assert.ok(near(platformFee(100) + hostEarnings(100), 100), "fee + earnings = gross");

// String totals (Prisma Decimal serializes as string) are handled.
assert.ok(near(hostEarnings("272"), 258.4), "string total parsed");

const b = (status: string, finalTotal: number): Booking => ({
  id: status + finalTotal,
  checkIn: "2026-01-01",
  checkOut: "2026-01-03",
  status,
  nights: 2,
  finalTotal,
  guests: 2,
});

const summary = summarizeEarnings([
  b("COMPLETED", 272), // available: 258.4
  b("CONFIRMED", 114), // pending: 108.3
  b("PENDING", 126), // ignored (not yet earning)
  b("CANCELLED", 999), // ignored
]);

assert.ok(near(summary.available, 258.4), "available = completed x 0.95");
assert.ok(near(summary.pending, 108.3), "pending = confirmed x 0.95");
assert.ok(near(summary.lifetime, 366.7), "lifetime = available + pending");
assert.ok(near(summary.grossVolume, 386), "gross excludes pending/cancelled");

console.log("earnings.selfcheck: all assertions passed");
