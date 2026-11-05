import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useNotifications } from '../hooks/useNotifications';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { useMarkAsRead } from '../hooks/useMarkAsRead';
import { useMarkAllAsRead } from '../hooks/useMarkAllAsRead';
import { notificationLink, type Notification } from '../types';
import NotificationOrderDetails from './NotificationOrderDetails';
import NotificationReservationDetails from './NotificationReservationDetails';

function groupByDay(notifications: Notification[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const groups: Record<string, Notification[]> = { today: [], yesterday: [], earlier: [] };

  notifications.forEach((n) => {
    const d = new Date(n.createdAt);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (day.getTime() === today.getTime()) groups.today.push(n);
    else if (day.getTime() === yesterday.getTime()) groups.yesterday.push(n);
    else groups.earlier.push(n);
  });
  return groups;
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationDropdown() {
  const { t, i18n } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const notifications = useMemo(() => data?.pages.flat() ?? [], [data]);
  const groups = useMemo(() => groupByDay(notifications), [notifications]);
  const dateLocale = i18n.language === 'en' ? 'en-GB' : 'fr-FR';

  // Infinite scroll — sentinel observes itself; clipping by the scroll container handles visibility
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: '100px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleClick = (notif: Notification) => {
    if (!notif.isRead) markAsRead.mutate(notif.id);
    const link = notificationLink(notif.type, notif.data);
    if (link) {
      setPanelOpen(false);
      navigate(link);
    }
  };

  const goToHistory = () => {
    setPanelOpen(false);
    navigate('/notifications');
  };

  const renderGroup = (label: string, items: Notification[]) =>
    items.length > 0 && (
      <div className="border-b border-border last:border-0">
        <h4 className="bg-muted/30 px-3 py-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </h4>
        {items.map((notif) => (
          <button
            key={notif.id}
            onClick={() => handleClick(notif)}
            className="flex w-full gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50"
          >
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notif.isRead ? 'bg-transparent' : 'bg-primary'}`}
            />
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-sm ${notif.isRead ? 'font-medium text-foreground' : 'font-semibold text-secondary'}`}>
                  {notif.title}
                </span>
                <span className="shrink-0 whitespace-nowrap text-[11px] text-muted-foreground">
                  {formatDate(notif.createdAt, dateLocale)}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{notif.message}</p>
              {notif.data?.orderId && <NotificationOrderDetails data={notif.data} />}
              {notif.data?.reservationId && <NotificationReservationDetails data={notif.data} />}
            </div>
          </button>
        ))}
      </div>
    );

  const list = (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h3 className="font-serif text-sm font-bold text-secondary">{t('notifications.title')}</h3>
        <button
          onClick={() => markAllRead.mutate()}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover"
        >
          <Check size={12} />
          {t('notifications.markAllRead')}
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">{t('notifications.empty')}</p>
      ) : (
        <>
          {renderGroup(t('notifications.today'), groups.today)}
          {renderGroup(t('notifications.yesterday'), groups.yesterday)}
          {renderGroup(t('notifications.earlier'), groups.earlier)}
        </>
      )}

      <div ref={loadMoreRef} className="flex justify-center p-2">
        {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
      </div>

      <button
        onClick={() => goToHistory()}
        className="border-t border-border py-2.5 text-center text-xs font-medium text-primary hover:bg-muted/50"
      >
        {t('notifications.viewAll')}
      </button>
    </div>
  );

  const bell = (
    <>
      <Bell size={18} className="text-secondary transition-colors hover:text-primary" />
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </>
  );

  if (isDesktop) {
    return (
      <Popover open={panelOpen} onOpenChange={setPanelOpen}>
        <PopoverTrigger className="relative" aria-label={t('notifications.title')}>
          {bell}
        </PopoverTrigger>
        <PopoverContent className="max-h-[70vh] w-96 overflow-y-auto bg-white p-0" align="end">
          {list}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={panelOpen} onOpenChange={setPanelOpen}>
      <DrawerTrigger className="relative" aria-label={t('notifications.title')}>
        {bell}
      </DrawerTrigger>
      <DrawerContent className="max-h-[70vh] bg-white">
        <div className="overflow-y-auto">{list}</div>
      </DrawerContent>
    </Drawer>
  );
}
