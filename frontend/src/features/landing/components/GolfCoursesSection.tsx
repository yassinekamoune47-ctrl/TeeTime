import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, Flag, MapPin } from 'lucide-react';
import { golfCourseApi, type ClubApi } from '@/api/endpoints/golf-course.api';
import SectionHeading from './SectionHeading';

const money = (value: number) =>
  new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value);

const minGreenFee = (club: ClubApi): number | null => {
  const fees = club.golf_courses
    .map((course) => Number(course.price_per_player))
    .filter((fee) => Number.isFinite(fee) && fee > 0);
  return fees.length > 0 ? Math.min(...fees) : null;
};

export default function GolfCoursesSection() {
  const { t, i18n } = useTranslation('landing');
  const { data: clubs = [], isLoading, isError } = useQuery<ClubApi[]>({
    queryKey: ['clubs', 'landing', i18n.language],
    queryFn: async () => (await golfCourseApi.getClubs()).data,
    staleTime: 60_000,
    retry: false,
  });

  const featured = clubs.filter((club) => club.status === 'ACTIVE').slice(0, 3);

  return (
    <section id="golf-courses" className="relative overflow-hidden bg-secondary py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(201,168,76,0.2),transparent_40%),radial-gradient(circle_at_5%_100%,rgba(255,255,255,0.08),transparent_45%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-25">
        <SectionHeading
          tone="dark"
          eyebrow={t('sections.courses.eyebrow')}
          title={t('sections.courses.title')}
          subtitle={t('sections.courses.subtitle')}
          action={
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-md border border-white/25 px-5 py-2.5 text-sm font-medium text-white/90 transition-colors hover:border-primary hover:text-primary"
            >
              {t('sections.courses.viewAll')}
              <ArrowUpRight size={16} />
            </Link>
          }
        />

        {isLoading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-[380px] animate-pulse rounded-xl bg-white/10" />
            ))}
          </div>
        ) : isError ? (
          <p className="mt-10 rounded-xl border border-white/15 bg-white/5 p-8 text-center text-sm text-white/60">
            {t('sections.courses.error')}
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {featured.map((club) => {
              const fee = minGreenFee(club);

              return (
                <Link
                  key={club.id}
                  to={`/reservations/${club.id}`}
                  className="group relative flex h-[380px] flex-col justify-end overflow-hidden rounded-xl border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-2xl"
                >
                  <img
                    src={club.cover_url || '/club 1.png'}
                    alt={club.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04120c] via-[#04120c]/55 to-transparent" />

                  <div className="relative flex flex-col gap-2 p-6">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/40 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
                      <MapPin size={11} />
                      {club.city}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white">{club.name}</h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-white/60">
                      {club.description}
                    </p>

                    <div className="mt-2 flex items-end justify-between gap-4 border-t border-white/15 pt-4 text-xs text-white/70">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5">
                          <Flag size={13} className="text-primary" />
                          {t('sections.courses.courseCount', { count: club.golf_courses.length })}
                        </span>
                        {fee !== null && (
                          <span className="whitespace-nowrap text-white/85">
                            {t('sections.courses.greenFee')}{' '}
                            <strong className="font-semibold text-primary">{money(fee)} MAD</strong>
                          </span>
                        )}
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 text-primary transition-transform group-hover:translate-x-0.5">
                        {t('sections.courses.discover')}
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
