import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getApiErrorMessage } from '@/lib/apiError';
import { useUpdateReservationStatus } from '../hooks/useUpdateReservationStatus';
import type { AdminRecentReservation } from '../types';

interface AdminPendingReservationsProps {
  requests: AdminRecentReservation[];
}

export default function AdminPendingReservations({ requests }: AdminPendingReservationsProps) {
  const { t, i18n } = useTranslation('app');
  const mutation = useUpdateReservationStatus();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const handleStatus = (id: string, status: 'ACCEPTED' | 'REJECTED', rejectReason?: string) => {
    setActiveId(id);
    mutation.mutate(
      { id, status, reason: rejectReason },
      {
        onSuccess: () => {
          toast.success(
            t(
              status === 'ACCEPTED'
                ? 'dashboard.admin.pendingRequests.accepted'
                : 'dashboard.admin.pendingRequests.rejected',
            ),
          );
          setRejectingId(null);
          setReason('');
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, t('dashboard.admin.pendingRequests.error')));
        },
        onSettled: () => setActiveId(null),
      },
    );
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(`${iso}T00:00:00`).toLocaleDateString(i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const startReject = (id: string) => {
    setRejectingId(id);
    setReason('');
  };

  const cancelReject = () => {
    setRejectingId(null);
    setReason('');
  };

  const confirmReject = () => {
    if (!rejectingId) return;
    handleStatus(rejectingId, 'REJECTED', reason.trim() || undefined);
  };

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xs font-medium tracking-widest text-primary">
          {t('dashboard.admin.pendingRequests.title')}
        </h3>
        <span className="text-xs text-muted-foreground">
          {t('dashboard.admin.pendingRequests.count', { count: requests.length })}
        </span>
      </div>

      {requests.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {t('dashboard.admin.pendingRequests.empty')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {requests.map((request) => {
            const isBusy = mutation.isPending && activeId === request.id;

            return (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{request.playerName}</span>
                  <span className="text-xs text-muted-foreground">
                    {request.clubName || '—'} · {request.courseName || '—'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(request.reservationDate)}
                    {request.time && ` · ${request.time}`}
                    {` · ${t('dashboard.admin.pendingRequests.players', {
                      count: request.numberOfPlayers,
                    })}`}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => handleStatus(request.id, 'ACCEPTED')}
                    disabled={isBusy}
                  >
                    <Check size={14} />
                    {t('dashboard.admin.pendingRequests.accept')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => startReject(request.id)}
                    disabled={isBusy}
                  >
                    <X size={14} />
                    {t('dashboard.admin.pendingRequests.reject')}
                  </Button>
                </div>

                {rejectingId === request.id && (
                  <div className="flex w-full items-center gap-2">
                    <Input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={300}
                      placeholder={t('dashboard.admin.pendingRequests.reasonPlaceholder')}
                      className="flex-1 border-border"
                      autoFocus
                    />
                    <Button size="sm" onClick={confirmReject} disabled={isBusy}>
                      {t('dashboard.admin.pendingRequests.confirmReject')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelReject}>
                      {t('dashboard.admin.pendingRequests.cancel')}
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
