import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { GiGolfTee } from 'react-icons/gi';
import { ArrowDown } from 'lucide-react';
import GolfBall3D from './GolfBall3D';

export default function Hero() {
  const { t } = useTranslation('landing');
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-end overflow-hidden bg-[#071b14]"
    >
      {/* Deep green backdrop with a warm gold halo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(201,168,76,0.22),transparent_48%),radial-gradient(circle_at_15%_10%,rgba(45,106,79,0.55),transparent_55%),linear-gradient(160deg,#0a241a_0%,#103526_48%,#061711_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.28) 1px, transparent 1px)',
          backgroundSize: '88px 88px',
          maskImage: 'radial-gradient(circle at 65% 45%, black 10%, transparent 70%)',
        }}
      />
      <div className="absolute right-[12%] top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-primary/15 blur-[110px]" />

      {/* Interactive 3D golf ball, scoped to this section only */}
      <GolfBall3D sectionRef={sectionRef} />

      {/* Contrast layers for the copy */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,18,12,0.92)_0%,rgba(4,18,12,0.62)_38%,rgba(4,18,12,0.08)_72%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#05140e] via-[#05140e]/70 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-32 md:px-25 md:pb-24">
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
          <span className="h-px w-10 bg-primary/70" />
          {t('hero.eyebrow')}
        </p>

        <h1 className="mt-5 max-w-2xl font-serif text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-[58px]">
          {t('hero.title')}
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
          {t('hero.tagline')}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
          <Link
            to="/reservations"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_-12px_rgba(201,168,76,0.9)] transition-colors hover:bg-primary-hover md:px-9 md:py-3.5"
          >
            <GiGolfTee size={18} />
            {t('hero.cta')}
          </Link>
          <Link
            to="/memberships"
            className="inline-flex items-center gap-2 rounded-md border border-white/25 px-7 py-3 text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:border-primary hover:text-primary md:px-9 md:py-3.5"
          >
            {t('hero.secondaryCta')}
          </Link>
        </div>

        <div className="mt-12 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/40 md:mt-16">
          <ArrowDown size={14} className="text-primary" />
          {t('hero.scroll')}
        </div>
      </div>
    </section>
  );
}
