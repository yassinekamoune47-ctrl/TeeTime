import { useTranslation } from 'react-i18next';
import type { NotificationReservationData } from '../types';

export default function NotificationReservationDetails({ data }: { data: NotificationReservationData }) {
  const { t, i18n } = useTranslation('app');

  const date = data.reservationDate
    ? new Date(`${data.reservationDate}T00:00:00`).toLocaleDateString(
        i18n.language.startsWith('fr') ? 'fr-FR' : 'en-GB',
        { day: '2-digit', month: 'short', year: 'numeric' },
      )
    : '';

  const meta = [
    data.clubName,
    [date, data.startTime].filter(Boolean).join(' · '),
    data.numberOfPlayers ? t('notifications.players', { count: data.numberOfPlayers }) : '',
  ]
    .filter(Boolean)
    .join(' — ');

  return (
    <div className="mt-1.5 rounded-md border border-border bg-muted/40 p-2 text-[11px] leading-relaxed text-muted-foreground">
      <p className="font-medium text-secondary">
        {t('notifications.reservation')} #{data.reservationId}
        {data.courseName ? ` · ${data.courseName}` : ''}
      </p>
      {meta && <p>{meta}</p>}
      {data.reason && (
        <p className="font-semibold text-primary">
          {t('notifications.reason')}: {data.reason}
        </p>
      )}
    </div>
  );
}
