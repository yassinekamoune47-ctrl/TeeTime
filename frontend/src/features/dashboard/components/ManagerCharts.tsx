import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { Card } from '@/components/ui/card';
import type { ManagerDashboardData, StatusCountPoint } from '../types';

const GOLD = '#C9A84C';
const GREEN = '#2D6A4F';
const SAGE = '#6B8E7F';
const TERRA = '#B0413E';

const STATUS_COLORS: Record<string, string> = {
  PENDING: GOLD,
  ACCEPTED: GREEN,
  REJECTED: TERRA,
};

function dayLabel(iso: string) {
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
}

const FALLBACK_STATUS_COLORS = [GOLD, GREEN, SAGE];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-xs font-medium tracking-widest text-primary">{title}</h3>
      {children}
    </Card>
  );
}

export default function ManagerCharts({ data }: { data: ManagerDashboardData }) {
  const { t } = useTranslation('app');

  const utilizationData = data.utilization.map((p) => ({
    date: dayLabel(p.date),
    rate: p.rate,
  }));

  const revenueData = data.revenue.map((p) => ({
    date: dayLabel(p.date),
    revenue: Math.round(p.revenue),
  }));

  const statusData = data.reservationsByStatus.map((s: StatusCountPoint, i) => ({
    name: s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] ?? FALLBACK_STATUS_COLORS[i % FALLBACK_STATUS_COLORS.length],
  }));

  return (
      <div>
        <div className="grid grid-cols-1 mb-7 gap-4 sm:grid-cols-2">
          {/* Line: Utilization */}
          <ChartCard title={t('dashboard.manager.charts.utilization')}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={utilizationData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} stroke="#6C757D" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#6C757D" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8E5E0', fontSize: 12 }} />
                <Line type="monotone" dataKey="rate" stroke={GOLD} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Donut: By Status */}
          <ChartCard title={t('dashboard.manager.charts.byStatus')}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8E5E0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-center gap-4">
              {statusData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs text-muted-foreground">{t(`dashboard.manager.charts.${d.name.toLowerCase()}`)}</span>
                  </div>
              ))}
            </div>
          </ChartCard>

          {/* Heatmap: Frequency */}
          {/*<ChartCard title={t('dashboard.manager.charts.frequency')}>*/}
          {/*  <div className="flex gap-1 overflow-x-auto">*/}
          {/*    {heatmapWeeks.map((week, wi) => (*/}
          {/*      <div key={wi} className="flex flex-col gap-1">*/}
          {/*        {week.map((cell, di) => (*/}
          {/*          <div*/}
          {/*            key={di}*/}
          {/*            className={`size-3 rounded-sm ${heatColor(cell.value)}`}*/}
          {/*            title={`${cell.value} joueurs`}*/}
          {/*          />*/}
          {/*        ))}*/}
          {/*      </div>*/}
          {/*    ))}*/}
          {/*  </div>*/}
          {/*  <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">*/}
          {/*    <span>−</span>*/}
          {/*    <span className="size-2.5 rounded-sm bg-muted" />*/}
          {/*    <span className="size-2.5 rounded-sm bg-primary/20" />*/}
          {/*    <span className="size-2.5 rounded-sm bg-primary/40" />*/}
          {/*    <span className="size-2.5 rounded-sm bg-primary/70" />*/}
          {/*    <span className="size-2.5 rounded-sm bg-primary" />*/}
          {/*    <span>+</span>*/}
          {/*  </div>*/}
          {/*</ChartCard>*/}
        </div>
        {/* Area: Revenue */}
        <ChartCard title={t('dashboard.manager.charts.revenue')}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} stroke="#6C757D" />
              <YAxis tick={{ fontSize: 10 }} stroke="#6C757D" />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8E5E0', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke={GREEN} strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
  );
}