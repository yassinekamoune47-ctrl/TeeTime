import { useTranslation } from 'react-i18next';
import { CalendarCheck, AlertCircle, Users, Banknote } from 'lucide-react';
import KpiCard from '@/components/shared/KpiCard';
import ManagerCharts from './ManagerCharts';
import { useManagerDashboard } from '../hooks/useManagerDashboard';

function formatNumber(value: number) {
  return new Intl.NumberFormat('fr-MA').format(Math.round(value));
}

function ManagerDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[92px] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-[420px] animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export default function ManagerDashboard() {
  const { t } = useTranslation('app');
  const { data, isLoading, isError } = useManagerDashboard();

  if (isLoading) return <ManagerDashboardSkeleton />;
  if (isError || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {t('dashboard.manager.error')}
      </div>
    );
  }

  const k = data.kpis;

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t('dashboard.manager.kpis.todayReservations')} value={formatNumber(k.todayReservations)} icon={CalendarCheck} />
        <KpiCard label={t('dashboard.manager.kpis.pendingRequests')} value={formatNumber(k.pendingRequests)} icon={AlertCircle} />
        <KpiCard label={t('dashboard.manager.kpis.members')} value={formatNumber(k.members)} icon={Users} />
        <KpiCard label={t('dashboard.manager.kpis.todayRevenue')} value={`${formatNumber(k.todayRevenue)} MAD`} icon={Banknote} />
      </div>

      {/* Charts + Pending Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <ManagerCharts data={data} />
        </div>
        {/*<PendingActionsQueue />*/}
      </div>

      {/* Tee Sheet + Activity Feed */}
      {/*<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">*/}
      {/*  <TeeSheetMini />*/}
      {/*  <ActivityFeed />*/}
      {/*</div>*/}
    </div>
  );
}