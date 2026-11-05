import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Check, CreditCard, Mail, Phone, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { membershipRequestApi } from '@/api/endpoints/membershipRequest.api';
import { getApiErrorMessage } from '@/lib/apiError';
import type { EMRStatus, MembershipRequest } from '@/features/memberships/types';

type StatusFilter = 'ALL' | EMRStatus;

const PAGE_SIZE = 20;

const statusStyles: Record<EMRStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-700',
  REJECTED: 'bg-red-500/10 text-red-700',
};

const money = (value: number) =>
  new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value);

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function MembershipsManagementPage() {
  const { t, i18n } = useTranslation('memberships');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<MembershipRequest[]>({
    queryKey: ['membershipRequests', 'admin', statusFilter],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await membershipRequestApi.searchAll({
        firstName: '',
        lastName: '',
        planName: '',
        status: statusFilter === 'ALL' ? null : statusFilter,
        page: pageParam as number,
        size: PAGE_SIZE,
      });
      return res.data.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage && lastPage.length < PAGE_SIZE ? undefined : allPages.length,
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
    retry: false,
  });

  const memberships = data?.pages.flat() ?? [];

  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'reject' }) =>
      action === 'accept' ? membershipRequestApi.accept(id) : membershipRequestApi.reject(id),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membershipRequests'] });
      queryClient.invalidateQueries({ queryKey: ['clubMembers'] });
      toast.success(
        variables.action === 'accept' ? t('admin.acceptedToast') : t('admin.rejectedToast'),
      );
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Date(`${value}T00:00:00`).toLocaleDateString(i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatMoment = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleString(i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-bold text-secondary">{t('admin.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('admin.subtitle')}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t('admin.count', { count: memberships.length })}
        </p>
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as StatusFilter[]).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'secondary' : 'outline'}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'ALL' ? t('admin.filterAll') : t(`admin.statuses.${status}`)}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">{t('admin.error')}</Card>
      ) : memberships.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">{t('admin.empty')}</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {memberships.map((membership) => (
            <Card key={membership.id} className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {initialsOf(membership.userFullName) || <UserRound size={18} />}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-serif text-sm font-bold text-secondary">
                      {membership.userFullName}
                    </span>
                    <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {membership.userEmail && (
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <Mail size={12} className="shrink-0" />
                          <span className="truncate">{membership.userEmail}</span>
                        </span>
                      )}
                      {membership.userPhone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} className="shrink-0" />
                          {membership.userPhone}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[membership.status]}`}
                  >
                    {t(`admin.statuses.${membership.status}`)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      membership.paymentStatus === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-700'
                        : 'bg-amber-500/10 text-amber-700'
                    }`}
                  >
                    <CreditCard size={11} />
                    {membership.paymentStatus === 'PAID' ? t('admin.paid') : t('admin.unpaid')}
                  </span>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-3 text-sm sm:grid-cols-3 lg:grid-cols-5">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    {t('admin.type')}
                  </dt>
                  <dd className="font-semibold text-secondary">{membership.planName}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    {t('admin.club')}
                  </dt>
                  <dd className="text-secondary">{membership.clubName || '—'}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    {t('admin.startDate')}
                  </dt>
                  <dd className="inline-flex items-center gap-1 text-secondary">
                    <CalendarDays size={13} className="text-primary" />
                    {formatDate(membership.startDate)}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    {t('admin.endDate')}
                  </dt>
                  <dd className="inline-flex items-center gap-1 text-secondary">
                    <CalendarDays size={13} className="text-primary" />
                    {formatDate(membership.endDate)}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    {t('admin.price')}
                  </dt>
                  <dd className="font-semibold text-secondary">{money(membership.price)} MAD</dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>
                    {t('admin.requestedOn')} {formatMoment(membership.createdAt)}
                  </span>
                  {membership.paidAt && (
                    <span>
                      {t('admin.paidOn')} {formatMoment(membership.paidAt)}
                    </span>
                  )}
                </div>
                {membership.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={statusMutation.isPending && statusMutation.variables?.id === membership.id}
                      onClick={() => statusMutation.mutate({ id: membership.id, action: 'reject' })}
                    >
                      <X size={14} />
                      {t('admin.reject')}
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1 bg-secondary text-white hover:bg-secondary/80"
                      disabled={statusMutation.isPending && statusMutation.variables?.id === membership.id}
                      onClick={() => statusMutation.mutate({ id: membership.id, action: 'accept' })}
                    >
                      <Check size={14} />
                      {t('admin.accept')}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {hasNextPage && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? t('admin.loadingMore') : t('admin.loadMore')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
