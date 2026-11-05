import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function CTASection() {
  const { t } = useTranslation('landing');

  return (
    <section className="py-16 text-center md:py-30">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="font-serif text-2xl font-bold text-primary-hover md:text-5xl">
          {t('cta.title')}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('cta.text')}
        </p>
        <Link
          to="/register"
          className="mt-6 inline-block rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover md:mt-8 md:py-4 md:text-base"
        >
          {t('cta.button')}
        </Link>
      </div>
    </section>
  );
}