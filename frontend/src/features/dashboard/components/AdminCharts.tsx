import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import type { AdminDashboardData, DailyCountPoint } from '../types';

const GOLD = '#C9A84C';
const GREEN = '#2D6A4F';
const SAGE = '#6B8E7F';

function monthLabel(ym: string, locale: string) {
  const [year, month] = ym.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(locale, { month: 'short' });
}

function dayLabel(iso: string) {
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
}

// 53 weeks × 7 days heatmap (full year), columns aligned so the last one ends today
function buildHeatmapWeeks(points: DailyCountPoint[]) {
  const byDate = new Map(points.map((p) => [p.date, p.count]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const offsetToMonday = (today.getDay() + 6) % 7; // 0 = Monday
  const addDays = (d: Date, n: number) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy;
  };
  const gridEnd = addDays(today, 6 - offsetToMonday);
  const start = addDays(gridEnd, -(53 * 7 - 1));

  const weeks: { value: number; future: boolean }[][] = [];
  for (let w = 0; w < 53; w++) {
    const col: { value: number; future: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      col.push({ value: byDate.get(iso) ?? 0, future: date > today });
    }
    weeks.push(col);
  }
  return weeks;
}

function heatColor(v: number, max: number) {
  if (v === 0) return 'bg-muted';
  const ratio = max > 0 ? v / max : 0;
  if (ratio < 0.25) return 'bg-primary/20';
  if (ratio < 0.5) return 'bg-primary/40';
  if (ratio < 0.75) return 'bg-primary/70';
  return 'bg-primary';
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-xs font-medium tracking-widest text-primary">{title}</h3>
      {children}
    </Card>
  );
}

export default function AdminCharts({ data }: { data: AdminDashboardData }) {
  const { t, i18n } = useTranslation('app');

  const usersGrowth = data.usersGrowth.map((p) => ({
    month: monthLabel(p.month, i18n.language),
    players: p.players,
    managers: p.managers,
    influencers: p.influencers,
  }));

  const reservations = data.reservationsTrend.map((p) => ({
    date: dayLabel(p.date),
    count: p.count,
  }));

  const topClubs = data.topClubs;

  const heatmapWeeks = buildHeatmapWeeks(data.activityHeatmap);
  const heatmapMax = Math.max(...data.activityHeatmap.map((p) => p.count), 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
      {/* Area: Users Growth */}
      <ChartCard title={t('dashboard.admin.charts.usersGrowth')}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={usersGrowth} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
            <defs>
              <linearGradient id="playersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GREEN} stopOpacity={0.3} />
                <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="managersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GOLD} stopOpacity={0.3} />
                <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#6C757D" />
            <YAxis tick={{ fontSize: 10 }} stroke="#6C757D" />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8E5E0', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="players" name={t('dashboard.admin.charts.players')} stroke={GREEN} fill="url(#playersGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="managers" name={t('dashboard.admin.charts.managers')} stroke={GOLD} fill="url(#managersGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="influencers" name={t('dashboard.admin.charts.influencers')} stroke={SAGE} fill="transparent" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Line: Reservations */}
      <ChartCard title={t('dashboard.admin.charts.reservations')}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={reservations} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} stroke="#6C757D" />
            <YAxis tick={{ fontSize: 10 }} stroke="#6C757D" />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8E5E0', fontSize: 12 }} />
            <Line type="monotone" dataKey="count" stroke={GOLD} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Bar: Top 10 Clubs */}
      <ChartCard title={t('dashboard.admin.charts.topClubs')}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={topClubs} layout="vertical" margin={{ top: 5, right: 5, bottom: 0, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} stroke="#6C757D" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#6C757D" width={70} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8E5E0', fontSize: 12 }} />
            <Bar dataKey="count" fill={GREEN} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Heatmap: daily activity over the full year */}
      <ChartCard title={t('dashboard.admin.charts.attendance')}>
        <div className="flex gap-[3px] overflow-x-auto pb-1">
          {heatmapWeeks.map((week, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              {week.map((day, d) => (
                <div
                  key={d}
                  title={day.future ? undefined : String(day.value)}
                  className={`h-3 w-3 rounded-[2px] ${day.future ? 'bg-transparent' : heatColor(day.value, heatmapMax)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}