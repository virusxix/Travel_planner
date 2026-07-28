/**
 * Bucket bookings into last N months for dashboard charts.
 * Expects booking.created_at (ISO string or Date) and numeric fee fields.
 */

function monthKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function monthLabel(key) {
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Last `months` calendar months ending this month, oldest → newest. */
export function lastMonthKeys(months = 6) {
  const keys = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

/**
 * @param {Array} bookings
 * @param {{ months?: number, amountField?: 'host_payout' | 'platform_fee' | 'total_price' }} opts
 */
export function monthlyBookingSeries(bookings = [], opts = {}) {
  const months = opts.months ?? 6;
  const amountField = opts.amountField ?? 'host_payout';
  const keys = lastMonthKeys(months);
  const map = Object.fromEntries(
    keys.map((k) => [k, { month: monthLabel(k), key: k, bookings: 0, amount: 0 }])
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

export function countByStatus(items = [], field = 'status') {
  const counts = {};
  for (const item of items) {
    const s = item[field] || 'unknown';
    counts[s] = (counts[s] || 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));
}

/** 0–100 progress toward a numeric goal */
export function goalProgress(current, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((Number(current) / goal) * 100));
}
