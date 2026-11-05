import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Home,
  MapPin,
  Phone,
  Truck,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getApiErrorMessage } from '@/lib/apiError';
import { useAuthStore } from '@/features/auth/store';
import { useMyOrders, usePayOrder } from '../hooks/useShop';

const money = (value: number) =>
  new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value);

type DeliveryField = 'fullName' | 'phone' | 'city' | 'address' | 'details';

export default function PaymentPage() {
  const { t, i18n } = useTranslation('shop');
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { data: orders = [], isLoading, isError } = useMyOrders();
  const mutation = usePayOrder();

  const [delivery, setDelivery] = useState<Record<DeliveryField, string>>(() => ({
    fullName: [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim(),
    phone: user?.phoneNumber ?? '',
    city: '',
    address: '',
    details: '',
  }));
  const [errors, setErrors] = useState<Partial<Record<DeliveryField, string>>>({});

  const order = orders.find((item) => item.id === orderId);

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const updateDelivery = (field: DeliveryField, value: string) => {
    setDelivery((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<DeliveryField, string>> = {};

    if (!delivery.fullName.trim()) next.fullName = t('payment.delivery.validation.fullName');
    if (!delivery.phone.trim()) next.phone = t('payment.delivery.validation.phone');
    if (!delivery.city.trim()) next.city = t('payment.delivery.validation.city');
    if (!delivery.address.trim()) next.address = t('payment.delivery.validation.address');

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!order || mutation.isPending) return;
    if (!validate()) return;

    mutation.mutate(
      {
        id: order.id,
        deliveryFullName: delivery.fullName.trim(),
        deliveryPhone: delivery.phone.trim(),
        deliveryCity: delivery.city.trim(),
        deliveryAddress: delivery.address.trim(),
        deliveryDetails: delivery.details.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success(t('payment.success'), {
            description: t('payment.successDescription'),
          });
          navigate('/orders');
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, t('payment.error')));
        },
      },
    );
  };

  const backLink = (
    <Link
      to="/orders"
      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
    >
      <ArrowLeft size={16} />
      {t('payment.back')}
    </Link>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <Banknote size={32} className="text-primary" />
          <p className="text-sm text-muted-foreground">{t('payment.notFound')}</p>
          {backLink}
        </Card>
      </div>
    );
  }

  if (order.paymentStatus === 'PAID') {
    return (
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <CheckCircle2 size={36} className="text-emerald-600" />
          <p className="font-serif text-lg font-bold text-secondary">{t('payment.alreadyPaid')}</p>
          {order.paidAt && (
            <p className="text-sm text-muted-foreground">
              {t('payment.paidOn')} {formatDate(order.paidAt)}
            </p>
          )}
          {backLink}
        </Card>
      </div>
    );
  }

  if (order.status !== 'ACCEPTED') {
    return (
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <Banknote size={32} className="text-primary" />
          <p className="text-sm text-muted-foreground">{t('payment.notAccepted')}</p>
          {backLink}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-bold text-secondary">{t('payment.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('payment.subtitle')}</p>
        </div>
        {backLink}
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]"
      >
        <Card className="flex flex-col gap-5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Truck size={18} className="text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-lg font-bold text-secondary">
                {t('payment.delivery.title')}
              </h2>
              <p className="text-sm text-muted-foreground">{t('payment.delivery.subtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="delivery-full-name">
                <User size={14} className="text-primary" />
                {t('payment.delivery.fullName')}
              </Label>
              <Input
                id="delivery-full-name"
                value={delivery.fullName}
                onChange={(e) => updateDelivery('fullName', e.target.value)}
                placeholder={t('payment.delivery.fullNamePlaceholder')}
                autoComplete="name"
                maxLength={100}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'delivery-full-name-error' : undefined}
              />
              {errors.fullName && (
                <p id="delivery-full-name-error" className="text-xs text-destructive">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="delivery-phone">
                <Phone size={14} className="text-primary" />
                {t('payment.delivery.phone')}
              </Label>
              <Input
                id="delivery-phone"
                type="tel"
                inputMode="tel"
                value={delivery.phone}
                onChange={(e) => updateDelivery('phone', e.target.value)}
                placeholder={t('payment.delivery.phonePlaceholder')}
                autoComplete="tel"
                maxLength={30}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'delivery-phone-error' : undefined}
              />
              {errors.phone && (
                <p id="delivery-phone-error" className="text-xs text-destructive">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="delivery-city">
                <MapPin size={14} className="text-primary" />
                {t('payment.delivery.city')}
              </Label>
              <Input
                id="delivery-city"
                value={delivery.city}
                onChange={(e) => updateDelivery('city', e.target.value)}
                placeholder={t('payment.delivery.cityPlaceholder')}
                autoComplete="address-level2"
                maxLength={100}
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? 'delivery-city-error' : undefined}
              />
              {errors.city && (
                <p id="delivery-city-error" className="text-xs text-destructive">
                  {errors.city}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="delivery-address">
                <Home size={14} className="text-primary" />
                {t('payment.delivery.address')}
              </Label>
              <Input
                id="delivery-address"
                value={delivery.address}
                onChange={(e) => updateDelivery('address', e.target.value)}
                placeholder={t('payment.delivery.addressPlaceholder')}
                autoComplete="street-address"
                maxLength={255}
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? 'delivery-address-error' : undefined}
              />
              {errors.address && (
                <p id="delivery-address-error" className="text-xs text-destructive">
                  {errors.address}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="delivery-details">
                {t('payment.delivery.details')}
                <span className="font-normal text-muted-foreground">
                  {t('payment.delivery.detailsOptional')}
                </span>
              </Label>
              <Textarea
                id="delivery-details"
                value={delivery.details}
                onChange={(e) => updateDelivery('details', e.target.value)}
                placeholder={t('payment.delivery.detailsPlaceholder')}
                maxLength={500}
                rows={3}
              />
            </div>
          </div>
        </Card>

        <Card className="flex h-fit flex-col gap-4 p-5 lg:sticky lg:top-6">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            {t('payment.summary')}
          </span>

          <div className="flex items-center gap-3">
            <img
              src={order.productImage || '/section1.png'}
              alt={order.productName}
              className="h-14 w-14 shrink-0 rounded-md object-cover"
            />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-secondary">{order.productName}</span>
              <span className="text-xs text-muted-foreground">
                {t('payment.orderNumber', { id: order.id })}
              </span>
              {order.size && order.color && (
                <span className="text-xs text-muted-foreground">
                  {t('payment.sizeColor', { size: order.size, color: order.color })}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{t('payment.unitPrice')}</span>
              <span>{money(order.unitPrice)} MAD</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{t('payment.quantity')}</span>
              <span>{order.quantity}</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-secondary">
              <span>{t('payment.total')}</span>
              <span>{money(order.amountDue)} MAD</span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('payment.paying') : t('payment.confirm')}
          </Button>
        </Card>
      </form>
    </div>
  );
}
