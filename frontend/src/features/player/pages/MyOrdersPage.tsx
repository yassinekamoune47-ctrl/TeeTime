import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMyOrders } from '@/features/shop/hooks/useShop';
import type { ProductOrderStatus } from '@/features/shop/types';

const statusStyles: Record<ProductOrderStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-700',
  REJECTED: 'bg-red-500/10 text-red-700',
};

const money = (value: number) =>
  new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value);

export default function MyOrdersPage() {
  const { t, i18n } = useTranslation('shop');
  const navigate = useNavigate();
  const { data: orders = [], isLoading, isFetching, isError } = useMyOrders();

  const awaitingPayment = orders.filter(
    (order) => order.status === 'ACCEPTED' && order.paymentStatus === 'UNPAID',
  );
  const nextPaymentId = awaitingPayment[0]?.id;

  useEffect(() => {
    if (isLoading || isFetching || !nextPaymentId) return;

    const seenKey = `order-payment-redirect:${nextPaymentId}`;
    if (sessionStorage.getItem(seenKey)) return;

    sessionStorage.setItem(seenKey, '1');
    navigate(`/orders/${nextPaymentId}/pay`);
  }, [isLoading, isFetching, nextPaymentId, navigate]);

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-bold text-secondary">{t('orders.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('orders.subtitle')}</p>
        </div>
        <Button variant="outline" className="gap-2 border-primary text-secondary" render={<Link to="/shop" />}>
          <ShoppingBag size={16} />
          {t('orders.browse')}
        </Button>
      </div>

      {awaitingPayment.length > 0 && (
        <Card className="flex flex-wrap items-center gap-3 border-primary/60 bg-primary/5 p-4">
          <Banknote size={20} className="shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-secondary">{t('orders.paymentDue')}</p>
            <p className="text-xs text-muted-foreground">
              {t('orders.paymentDueHint', { count: awaitingPayment.length })}
            </p>
          </div>
          <Button className="gap-2" render={<Link to={`/orders/${awaitingPayment[0].id}/pay`} />}>
            <Banknote size={16} />
            {t('orders.payNow')}
          </Button>
        </Card>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {t('orders.error')}
        </p>
      ) : orders.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <ShoppingBag size={32} className="text-primary" />
          <p className="text-sm text-muted-foreground">{t('orders.empty')}</p>
          <Button render={<Link to="/shop" />}>{t('orders.browse')}</Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Card key={order.id} className="flex flex-wrap items-center gap-4 p-4">
              <img
                src={order.productImage || '/section1.png'}
                alt={order.productName}
                className="h-16 w-16 shrink-0 rounded-md object-cover"
              />

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-serif text-sm font-bold text-secondary">{order.productName}</span>
                <span className="text-xs text-muted-foreground">
                  {t('orders.quantity')} : {order.quantity} · {t('orders.unitPrice')} : {money(order.unitPrice)} MAD
                </span>
                {(order.size || order.color) && (
                  <span className="text-xs text-muted-foreground">
                    {order.size ? `${t('orders.size')} : ${order.size}` : ''}
                    {order.size && order.color ? ' · ' : ''}
                    {order.color ? `${t('orders.color')} : ${order.color}` : ''}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {t('orders.date')} {formatDate(order.createdAt)}
                </span>
                {order.notes && (
                  <span className="text-xs italic text-muted-foreground">{t('orders.notes')} : {order.notes}</span>
                )}
              </div>

              <div className="ml-auto flex flex-col items-end gap-2">
                <span className="font-semibold text-secondary">{money(order.amountDue)} MAD</span>

                <div className="flex flex-wrap justify-end gap-1">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[order.status]}`}
                  >
                    {t(`orders.status.${order.status}`)}
                  </span>

                  {order.paymentStatus === 'PAID' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      <CheckCircle2 size={11} />
                      {t('orders.paid')}
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {order.status === 'ACCEPTED' ? t('orders.awaitingPayment') : t('orders.unpaid')}
                    </span>
                  )}
                </div>

                {order.status === 'ACCEPTED' && order.paymentStatus === 'UNPAID' && (
                  <Button size="sm" className="gap-2" render={<Link to={`/orders/${order.id}/pay`} />}>
                    <Banknote size={14} />
                    {t('orders.payNow')}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
