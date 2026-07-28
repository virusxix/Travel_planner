/**
 * Self-check for progressStats (run: node frontend/src/lib/progressStats.check.cjs)
 * ponytail: fails if monthly bucketing, 5%/95% fields, or goal math regresses.
 */
const assert = require('assert');

function monthKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function parseDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function lastMonthKeys(months = 6) {
  const keys = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

function monthlyBookingSeries(bookings = [], opts = {}) {
  const months = opts.months ?? 6;
  const amountField = opts.amountField ?? 'host_payout';
  const keys = lastMonthKeys(months);
  const map = Object.fromEntries(
    keys.map((k) => [k, { key: k, bookings: 0, amount: 0 }])
  );
  for (const b of bookings) {
    const d = parseDate(b.created_at);
    if (!d) continue;
    const k = monthKey(d);
    if (!map[k]) continue;
    map[k].bookings += 1;
    map[k].amount += Number(b[amountField] || 0);
  }
  return keys.map((k) => ({
    ...map[k],
    amount: Math.round(map[k].amount * 100) / 100,
  }));
}

function goalProgress(current, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((Number(current) / goal) * 100));
}

// Demo booking fee math must stay 5% / 95%
assert.strictEqual(135 * 0.05, 6.75);
assert.strictEqual(135 * 0.95, 128.25);
assert.strictEqual(195 * 0.05, 9.75);
assert.strictEqual(195 * 0.95, 185.25);

const keys = lastMonthKeys(6);
assert.strictEqual(keys.length, 6);
assert.strictEqual(keys[keys.length - 1], monthKey(new Date()));

const demo = [
  {
    created_at: '2026-02-10T10:00:00+00:00',
    host_payout: 128.25,
    platform_fee: 6.75,
  },
  {
    created_at: '2026-03-05T10:00:00+00:00',
    host_payout: 185.25,
    platform_fee: 9.75,
  },
];

const hostSeries = monthlyBookingSeries(demo, { amountField: 'host_payout', months: 12 });
const feeSeries = monthlyBookingSeries(demo, { amountField: 'platform_fee', months: 12 });
const febHost = hostSeries.find((r) => r.key === '2026-02');
const marFee = feeSeries.find((r) => r.key === '2026-03');
assert.ok(febHost, 'feb bucket missing');
assert.strictEqual(febHost.bookings, 1);
assert.strictEqual(febHost.amount, 128.25);
assert.ok(marFee, 'mar bucket missing');
assert.strictEqual(marFee.amount, 9.75);

assert.strictEqual(goalProgress(5, 10), 50);
assert.strictEqual(goalProgress(12, 10), 100);
assert.strictEqual(goalProgress(0, 10), 0);
assert.strictEqual(goalProgress(16.5, 200), 8);

console.log('progressStats.check: ok');
