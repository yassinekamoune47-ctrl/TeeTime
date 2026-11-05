import { useTranslation } from 'react-i18next';
import type { NotificationOrderData } from '../types';

const money = (value: number) =>
  new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value);

export default function NotificationOrderDetails({ data }: { data: NotificationOrderData }) {
  const { t } = useTranslation('app');
  const meta = [
    data.size ? `${t('notifications.size')} ${data.size}` : '',
    data.color ? `${t('notifications.color')} ${data.color}` : '',
    data.quantity ? `${t('notifications.quantity')} ${data.quantity}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="mt-1.5 rounded-md border border-border bg-muted/40 p-2 text-[11px] leading-relaxed text-muted-foreground">
      <p className="font-medium text-secondary">
        {t('notifications.order')} #{data.orderId}
        {data.productName ? ` · ${data.productName}` : ''}
      </p>
      {meta && <p>{meta}</p>}
      {typeof data.amountDue === 'number' && (
        <p className="font-semibold text-primary">
          {t('notifications.total')} {money(data.amountDue)} MAD
        </p>
      )}
    </div>
  );
}
