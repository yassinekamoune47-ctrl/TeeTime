import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkAsRead } from '../hooks/useMarkAsRead';
import { useMarkAllAsRead } from '../hooks/useMarkAllAsRead';
import { notificationLink } from '../types';
import NotificationOrderDetails from '../components/NotificationOrderDetails';
import NotificationReservationDetails from '../components/NotificationReservationDetails';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const { t } = useTranslation('app');
  const navigate = useNavigate();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const notifications = data?.pages.flat() ?? [];

  return (
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold text-secondary">{t('notifications.title')}</h1>
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            {t('notifications.markAllRead')}
          </Button>
        </div>

        {notifications.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">{t('notifications.empty')}</p>
        ) : (
            <div className="divide-y divide-border rounded-xl border border-border bg-surface">
              {notifications.map((n) => (
                  <button
                      key={n.id}
                      onClick={() => {
                        if (!n.isRead) markAsRead.mutate(n.id);
                        const link = notificationLink(n.type, n.data);
                        if (link) navigate(link);
                      }}
                      className={`flex w-full items-start gap-3 p-4 text-left hover:bg-muted/50 ${n.isRead ? '' : 'bg-primary/5'}`}
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-primary'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      {n.data?.orderId && <NotificationOrderDetails data={n.data} />}
                      {n.data?.reservationId && <NotificationReservationDetails data={n.data} />}
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
                  </button>
              ))}
            </div>
        )}

        {hasNextPage && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? '...' : t('notifications.loadMore')}
              </Button>
            </div>
        )}
      </div>
  );
}