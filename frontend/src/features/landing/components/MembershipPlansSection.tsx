import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Check, Crown } from 'lucide-react';
import { membershipApi } from '@/api/endpoints/membership.api';
import type { Membership } from '@/features/memberships/types';
import SectionHeading from './SectionHeading';

const money = (value: number) =>
  new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value);

export default function MembershipPlansSection() {
  const { t, i18n } = useTranslation('landing');
  const { data: plans = [], isLoading, isError } = useQuery<Membership[]>({
    queryKey: ['memberships', 'landing', 'featured', i18n.language],
    queryFn: async () => {
      const res = await membershipApi.searchAllMemberships({
        title: '',
        price: null,
        clubName: '',
        page: 0,
        size: 3,
      });
      return res.data.data as Membership[];
    },
    staleTime: 60_000,
    retry: false,
  });

  return (
    <section id="membership-plans" className="relative overflow-hidden bg-surface py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(201,168,76,0.12),transparent_35%),radial-gradient(circle_at_100%_100%,rgba(45,106,79,0.1),transparent_40%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-25">
        <SectionHeading
          eyebrow={t('sections.memberships.eyebrow')}
          title={t('sections.memberships.title')}
          subtitle={t('sections.memberships.subtitle')}
          action={
            <Link
              to="/memberships"
              className="inline-flex items-center gap-2 rounded-md border border-secondary/25 px-5 py-2.5 text-sm font-medium text-secondary transition-colors hover:border-primary hover:text-primary-hover"
            >
              {t('sections.memberships.viewAll')}
              <ArrowUpRight size={16} />
            </Link>
          }
        />

        {isLoading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-[380px] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <p className="mt-10 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {t('sections.memberships.error')}
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl"
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 opacity-70 transition-opacity group-hover:opacity-100" />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-hover">
                      <Crown size={12} />
                      {t('sections.memberships.eyebrow')}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-secondary">{plan.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {plan.club?.name}
                      {plan.club?.city ? ` · ${plan.club.city}` : ''}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-end gap-1.5">
                  <span className="font-serif text-4xl font-bold text-primary">{money(plan.price)}</span>
                  <span className="pb-1 text-xs font-medium text-muted-foreground">
                    MAD {t('sections.memberships.perYear')}
                  </span>
                </div>

                <div className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-border/70 pt-5">
                  {(plan.benefits?.length > 0 ? plan.benefits.slice(0, 3) : [plan.description])
                    .filter(Boolean)
                    .map((benefit, index) => (
                      <p key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                        <span className="line-clamp-2">{benefit}</span>
                      </p>
                    ))}
                </div>

                <Link
                  to="/memberships"
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-secondary-hover"
                >
                  {t('sections.memberships.choose')}
                  <ArrowUpRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
