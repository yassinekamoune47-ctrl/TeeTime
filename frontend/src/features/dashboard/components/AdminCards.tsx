import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';

const GOLD = '#C9A84C';
const GREEN = '#2D6A4F';
const SAGE = '#6B8E7F';

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

const usersGrowth = months.map((m, i) => ({
  month: m,
  players: 800 + i * 40 + ((i * 17) % 60),
  managers: 30 + Math.floor(i * 1.5),
  influencers: 5 + Math.floor(i * 0.8),
}));

const reservations = Array.from({ length: 30 }, (_, i) => ({
  date: `${String(i + 1).padStart(2, '0')}/07`,
  count: 80 + ((i * 23) % 60),
}));

const topClubs = [
  { name: 'Palais Royal', count: 380 },
  { name: 'Dar Es Salam', count: 320 },
  { name: 'Michlifen', count: 285 },
  { name: 'Anfa Mohammedia', count: 240 },
  { name: 'Sofitel Golf', count: 210 },
  { name: 'Palmeraie', count: 185 },
  { name: 'Ocean Golf', count: 160 },
  { name: 'Fes Golf', count: 140 },
  { name: 'Tanger Golf', count: 120 },
  { name: 'Agadir Golf', count: 95 },
];

// 53 weeks × 7 days heatmap (full year)
const heatmapWeeks = Array.from({ length: 53 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => ({
    value: ((w * 7 + d) * 41) % 130,
  }))
);

function heatColor(v: number) {
  if (v === 0) return 'bg-muted';
  if (v < 25) return 'bg-primary/20';
  if (v < 50) return 'bg-primary/40';
  if (v < 75) return 'bg-primary/70';
  if (v < 100) return 'bg-primary';
  return 'bg-secondary';
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-xs font-medium tracking-widest text-primary">{title}</h3>
      {children}
    </Card>
  );
}

export default function AdminCharts() {
  const { t } = useTranslation('app');

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

      {/* Heatmap: Full year attendance */}
      <ChartCard title={t('dashboard.admin.charts.attendance')}>
        <div className="flex gap-0.75 overflow-x-auto pb-1">
          {heatmapWeeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.75">
              {week.map((cell, di) => (
                <div
                  key={di}
                  className={`size-3 rounded-sm ${heatColor(cell.value)}`}
                  title={`${cell.value} joueurs`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
          <span>−</span>
          <span className="size-2.5 rounded-sm bg-muted" />
          <span className="size-2.5 rounded-sm bg-primary/20" />
          <span className="size-2.5 rounded-sm bg-primary/40" />
          <span className="size-2.5 rounded-sm bg-primary/70" />
          <span className="size-2.5 rounded-sm bg-primary" />
          <span className="size-2.5 rounded-sm bg-secondary" />
          <span>+</span>
        </div>
      </ChartCard>
    </div>
  );
}