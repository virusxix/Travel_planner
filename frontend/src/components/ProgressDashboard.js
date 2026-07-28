import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { goalProgress } from '@/lib/progressStats';

const PRIMARY = 'hsl(10, 57%, 51%)';
const ACCENT = 'hsl(34, 50%, 64%)';
const SECONDARY = 'hsl(131, 9%, 49%)';
const MUTED = 'hsl(45, 10%, 80%)';
const PIE_COLORS = [PRIMARY, SECONDARY, ACCENT, MUTED, '#94a3b8'];

function Card({ title, subtitle, children, testId }) {
  return (
    <div
      className="bg-white border border-black/[0.06] shadow-sm rounded-3xl p-5 sm:p-6"
      data-testid={testId}
    >
      <div className="mb-4">
        <h3 className="text-lg font-display font-medium text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyChart({ label = 'No data yet' }) {
  return (
    <div className="h-[220px] flex items-center justify-center rounded-2xl bg-[#fafafa] text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function MoneyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white border border-black/[0.08] shadow-md px-3 py-2 text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-muted-foreground">
          {p.name}:{' '}
          <span className="font-semibold text-foreground">
            {p.dataKey === 'amount' || p.name?.toLowerCase?.().includes('sgd')
              ? `SGD ${Number(p.value).toFixed(2)}`
              : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

function formatGoalValue(value, format) {
  const n = Number(value) || 0;
  if (format === 'money') return n.toFixed(2);
  return String(Math.round(n) === n ? n : Math.round(n * 100) / 100);
}

export function GoalTrackers({ goals = [] }) {
  if (!goals.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="goal-trackers">
      {goals.map((g) => {
        const pct = goalProgress(g.current, g.target);
        const cur = formatGoalValue(g.current, g.format);
        const tgt = formatGoalValue(g.target, g.format);
        const prefix = g.format === 'money' ? 'SGD ' : '';
        return (
          <div
            key={g.id}
            className="bg-white border border-black/[0.06] shadow-sm rounded-2xl p-4"
            data-testid={`goal-${g.id}`}
          >
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <p className="text-sm font-medium text-foreground">{g.label}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {prefix}
                {cur}
                {g.suffix || ''} / {prefix}
                {tgt}
                {g.suffix || ''}
              </p>
            </div>
            <div className="h-2.5 rounded-full bg-[#ececee] overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{pct}% of goal</p>
          </div>
        );
      })}
    </div>
  );
}

export function EarningsTrendChart({
  data = [],
  amountLabel = 'Earnings (SGD)',
  title = 'Earnings over time',
  subtitle = 'Last 6 months · by booking date',
}) {
  const hasData = data.some((d) => d.amount > 0 || d.bookings > 0);
  return (
    <Card title={title} subtitle={subtitle} testId="earnings-trend-chart">
      {!hasData ? (
        <EmptyChart label="No earnings yet — bookings will show here" />
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#78716c' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<MoneyTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                name={amountLabel}
                stroke={PRIMARY}
                fill="url(#earnFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

export function BookingsBarChart({ data = [] }) {
  const hasData = data.some((d) => d.bookings > 0);
  return (
    <Card
      title="Bookings over time"
      subtitle="Last 6 months · by booking date"
      testId="bookings-bar-chart"
    >
      {!hasData ? (
        <EmptyChart label="No bookings yet" />
      ) : (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#78716c' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<MoneyTooltip />} />
              <Bar dataKey="bookings" name="Bookings" fill={SECONDARY} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

export function StatusDonutChart({ data = [], title = 'Status breakdown', subtitle }) {
  const hasData = data.some((d) => d.value > 0);
  return (
    <Card title={title} subtitle={subtitle} testId="status-donut-chart">
      {!hasData ? (
        <EmptyChart />
      ) : (
        <div className="h-[240px] w-full flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <ul className="hidden sm:block shrink-0 space-y-2 pr-2 text-sm">
            {data.map((d, i) => (
              <li key={d.name} className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                {d.name}: <span className="font-medium text-foreground">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
