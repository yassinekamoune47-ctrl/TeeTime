import { useTranslation } from 'react-i18next';
import { Users, Building, CalendarCheck, AlertCircle, Trophy } from 'lucide-react';
import KpiCard from '@/components/shared/KpiCard';
import { Card } from '@/components/ui/card';
import AdminCharts from './AdminCharts';
import AdminPendingReservations from './AdminPendingReservations';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

function formatNumber(value: number) {
  return new Intl.NumberFormat('fr-MA').format(Math.round(value));
}

function formatDate(iso: string, locale: string) {
  if (!iso) return '—';
  return new Date(`${iso}T00:00:00`).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_STYLES: Record<string, string> = {
  ACCEPTED: 'bg-emerald-500/10 text-emerald-700',
  CONFIRMED: 'bg-emerald-500/10 text-emerald-700',
  PENDING: 'bg-amber-500/10 text-amber-700',
  REJECTED: 'bg-red-500/10 text-red-700',
  CANCELLED: 'bg-muted text-muted-foreground',
  COMPLETED: 'bg-primary/10 text-primary',
};

function trendLabel(pct: number) {
  if (pct > 0) return `+${pct}%`;
  if (pct < 0) return `${pct}%`;
  return undefined;
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-[92px] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-[232px] animate-pulse rounded-xl bg-muted" />
      <div className="h-[232px] animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export default function AdminDashboard() {
  const { t, i18n } = useTranslation('app');
  const { data, isLoading, isError } = useAdminDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {t('dashboard.admin.error')}
      </div>
    );
  }

  const k = data.kpis;
  const pendingApprovals = k.pendingReservations + k.pendingMembershipRequests;

  return (
    <div className="flex flex-col gap-6">
      {/* 6 KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label={t('dashboard.admin.kpis.totalUsers')} value={formatNumber(k.totalUsers)} icon={Users} />
        <KpiCard label={t('dashboard.admin.kpis.totalClubs')} value={formatNumber(k.totalClubs)} icon={Building} />
        <KpiCard label={t('dashboard.admin.kpis.totalReservations')} value={formatNumber(k.reservationsLast30Days)} icon={CalendarCheck} trend={trendLabel(k.reservationsTrendPct)} />
        <KpiCard label={t('dashboard.admin.kpis.pendingApprovals')} value={formatNumber(pendingApprovals)} icon={AlertCircle} />
        <KpiCard label={t('dashboard.admin.kpis.activeTournaments')} value={formatNumber(k.activeTournaments)} icon={Trophy} />
        {/*<KpiCard label={t('dashboard.admin.kpis.revenue')} value={`${formatNumber(k.revenueLast30Days)} MAD`} icon={Banknote} trend={trendLabel(k.revenueTrendPct)} />*/}
      </div>

      <AdminCharts data={data} />

      <AdminPendingReservations requests={data.pendingReservationRequests} />

      {/* Recent reservations — includes the reservation date saved at booking time */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-xs font-medium tracking-widest text-primary">
            {t('dashboard.admin.recentReservations.title')}
          </h3>
          <span className="text-xs text-muted-foreground">
            {t('dashboard.admin.recentReservations.count', { count: data.recentReservations.length })}
          </span>
        </div>

        {data.recentReservations.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('dashboard.admin.recentReservations.empty')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">{t('dashboard.admin.recentReservations.date')}</th>
                  <th className="py-2 pr-4 font-medium">{t('dashboard.admin.recentReservations.time')}</th>
                  <th className="py-2 pr-4 font-medium">{t('dashboard.admin.recentReservations.player')}</th>
                  <th className="py-2 pr-4 font-medium">{t('dashboard.admin.recentReservations.club')}</th>
                  <th className="py-2 pr-4 font-medium">{t('dashboard.admin.recentReservations.course')}</th>
                  <th className="py-2 pr-4 font-medium">{t('dashboard.admin.recentReservations.players')}</th>
                  <th className="py-2 font-medium">{t('dashboard.admin.recentReservations.status')}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentReservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b border-border/60 last:border-0">
                    <td className="whitespace-nowrap py-2.5 pr-4 font-medium text-foreground">
                      {formatDate(reservation.reservationDate, i18n.language)}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-muted-foreground">
                      {reservation.time || '—'}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-foreground">{reservation.playerName}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{reservation.clubName || '—'}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{reservation.courseName || '—'}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{reservation.numberOfPlayers}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          STATUS_STYLES[reservation.status] ?? 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {t(`dashboard.admin.recentReservations.statuses.${reservation.status}`, {
                          defaultValue: reservation.status,
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}