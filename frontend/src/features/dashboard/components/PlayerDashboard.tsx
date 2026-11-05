import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, Building2, Trophy, Clock, ChevronRight, MapPin, Users } from 'lucide-react';
import KpiCard from '@/components/shared/KpiCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/features/auth/store';
import { usePlayerDashboard } from '../hooks/usePlayerDashboard';

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

// Membership badge style varies with the plan the player actually holds
function membershipBadgeClass(title: string) {
  const value = title.toLowerCase();
  if (value.includes('vip') || value.includes('elite')) {
    return 'border-primary bg-primary text-primary-foreground';
  }
  if (value.includes('premium') || value.includes('gold') || value.includes('annuel') || value.includes('annual')) {
    return 'border-secondary bg-secondary/15 text-secondary';
  }
  return 'border-primary bg-primary/15 text-primary';
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'ACCEPTED':
      return 'border-secondary bg-secondary/15 text-secondary';
    case 'PENDING':
      return 'border-primary bg-primary/15 text-primary';
    default:
      return 'border-border bg-muted text-muted-foreground';
  }
}

function PlayerDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[92px] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-56 animate-pulse rounded-xl bg-muted" />
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export default function PlayerDashboard() {
  const { t } = useTranslation('app');
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = usePlayerDashboard();

  if (isLoading) return <PlayerDashboardSkeleton />;
  if (isError || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {t('dashboard.player.error')}
      </div>
    );
  }

  const k = data.kpis;
  const next = data.nextReservation;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <h2 className="font-serif text-2xl font-bold text-secondary">
        {t('dashboard.welcome', { name: user?.firstName || user?.email?.split('@')[0] || '' })}
      </h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label={t('dashboard.kpis.nextTeeTime')} value={k.nextTeeTime ?? '—'} icon={Clock} />
        <KpiCard label={t('dashboard.kpis.reservations')} value={k.totalReservations} icon={Calendar} />
        <KpiCard label={t('dashboard.kpis.clubs')} value={k.clubsCount} icon={Building2} />
        <KpiCard label={t('dashboard.kpis.upcoming')} value={k.upcomingCount} icon={Trophy} />
      </div>

      {/* Next reservation — big section (with empty state) */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-medium tracking-widest text-primary">
            {t('dashboard.player.nextReservation')}
          </h3>
          <Link to="/my-reservations" className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover">
            {t('dashboard.player.viewAll')}
            <ChevronRight size={14} />
          </Link>
        </div>

        {next ? (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col md:flex-row">
            {/* Course picture */}
            <div className="h-40 w-full md:h-auto md:w-2/5">
              <img
                src={next.courseImage || next.clubLogoURL || '/teetime-logo.png'}
                alt={next.courseName}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col gap-3 p-5">
              {/* Club name with small logo beside it */}
              <div className="flex flex-row justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={next.clubLogoURL || '/teetime-logo.png'}
                    alt={next.clubName}
                    className="h-10 w-10 shrink-0 rounded-full border-2 border-primary object-cover"
                  />
                  <h4 className="font-serif text-xl font-bold text-secondary md:text-3xl">
                    {next.clubName}
                  </h4>
                </div>

                <span className="flex items-center gap-1.5 text-xl font-serif font-bold text-primary md:text-3xl">
                  {next.time}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-base text-muted-foreground">
                <MapPin size={14} className="text-primary" />
                <span>{next.courseName}</span>
                {next.holeCount > 0 && (
                  <Badge className="border border-primary bg-primary/10 text-primary">
                    {next.holeCount} holes
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary" />
                  {formatDate(next.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-primary" />
                  {next.players}
                </span>
                <Badge className={statusBadgeClass(next.status)}>
                  {next.status}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
        ) : (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            {t('dashboard.player.noUpcoming')}
          </Card>
        )}
      </section>

      {/* Recent reservations — list */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-medium tracking-widest text-primary">
            {t('dashboard.player.recentReservations')}
          </h3>
          <Link to="/my-reservations" className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover">
            {t('dashboard.player.viewAll')}
            <ChevronRight size={14} />
          </Link>
        </div>

        <Card className="p-5">
          <div className="flex flex-col gap-3">
            {data.recentReservations.length === 0 ? (
              <p className="py-2 text-center text-sm text-muted-foreground">
                {t('dashboard.player.noRecent')}
              </p>
            ) : (
              data.recentReservations.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground">{r.clubName}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(r.date)} · {r.time}</span>
                  </div>
                  <Badge className={statusBadgeClass(r.status)}>
                    {r.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      {/* My clubs — cards grid with empty state */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-medium tracking-widest text-primary">
            {t('dashboard.player.myClubs')}
          </h3>
          <Link to="/my-clubs" className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover">
            {t('dashboard.player.manage')}
            <ChevronRight size={14} />
          </Link>
        </div>

        {data.myClubs.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            {t('dashboard.player.noClubs')}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.myClubs.map((club) => (
              <Card key={club.clubId} className="flex flex-col items-center gap-2 p-4 text-center">
                <img
                  src={club.clubLogoURL || '/teetime-logo.png'}
                  alt={club.clubName}
                  className="h-12 w-12 rounded-full border-2 border-primary object-cover"
                />
                <h4 className="font-serif text-sm font-bold text-secondary">{club.clubName}</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} className="text-primary" />
                  <span>{club.clubCity}</span>
                </div>
                <Badge className={`text-xs ${membershipBadgeClass(club.membershipTitle)}`}>
                  {club.membershipTitle}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}