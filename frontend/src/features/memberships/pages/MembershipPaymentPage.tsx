import { type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Banknote, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getApiErrorMessage } from '@/lib/apiError';
import { useMembership } from '../hooks/useMembership';
import { useSubscribeMembership } from '../hooks/useSubscribeMembership';

const money = (value: number) =>
  new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value);

export default function MembershipPaymentPage() {
  const { t } = useTranslation('memberships');
  const { membershipId } = useParams<{ membershipId: string }>();
  const navigate = useNavigate();
  const { data: membership, isLoading, isError } = useMembership(membershipId);
  const mutation = useSubscribeMembership();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!membership || mutation.isPending) return;

    mutation.mutate(
      { membershipId: membership.id },
      {
        onSuccess: () => {
          toast.success(t('checkout.success'), {
            description: t('checkout.successDescription'),
          });
          navigate('/memberships');
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, t('checkout.error')));
        },
      },
    );
  };

  const backLink = (
    <Link
      to="/memberships"
      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
    >
      <ArrowLeft size={16} />
      {t('checkout.back')}
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

  if (isError || !membership) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <Banknote size={32} className="text-primary" />
          <p className="text-sm text-muted-foreground">{t('checkout.notFound')}</p>
          {backLink}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-bold text-secondary">{t('checkout.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('checkout.subtitle')}</p>
        </div>
        {backLink}
      </div>

      <form onSubmit={handleSubmit} className="max-w-md">
        <Card className="flex h-fit flex-col gap-4 p-5">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">
            {t('checkout.summary')}
          </span>

          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Building2 size={22} className="text-primary" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-secondary">{membership.title}</span>
              <span className="text-xs text-muted-foreground">{membership.club?.name}</span>
            </div>
          </div>

          {membership.club?.city && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin size={13} className="text-primary" />
              {membership.club.city}
            </div>
          )}

          <div className="flex flex-col gap-1 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{t('checkout.subscriptionPrice')}</span>
              <span>
                {money(membership.price)} MAD {t('item.perYear')}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-secondary">
              <span>{t('checkout.total')}</span>
              <span>{money(membership.price)} MAD</span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('checkout.paying') : t('checkout.confirm')}
          </Button>
        </Card>
      </form>
    </div>
  );
}
