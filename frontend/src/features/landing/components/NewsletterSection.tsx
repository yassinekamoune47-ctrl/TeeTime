import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SectionHeading from './SectionHeading';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterSection() {
  const { t } = useTranslation('landing');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(true);
      setSubscribed(false);
      return;
    }
    setError(false);
    setSubscribed(true);
    setEmail('');
  };

  return (
    <section id="newsletter" className="bg-background py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-25">
        <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-secondary px-6 py-12 md:px-16 md:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(201,168,76,0.25),transparent_45%),radial-gradient(circle_at_5%_95%,rgba(255,255,255,0.08),transparent_40%)]" />

          <div className="relative grid gap-10 md:grid-cols-[1.15fr_1fr] md:items-center">
            <div>
              <SectionHeading
                tone="dark"
                eyebrow={t('sections.newsletter.eyebrow')}
                title={t('sections.newsletter.title')}
                subtitle={t('sections.newsletter.subtitle')}
              />
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
              <label htmlFor="newsletter-email" className="sr-only">
                {t('sections.newsletter.placeholder')}
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/50" />
                  <Input
                    id="newsletter-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError(false);
                    }}
                    placeholder={t('sections.newsletter.placeholder')}
                    aria-invalid={error}
                    className="h-12 border-transparent bg-white/95 pl-10 text-secondary placeholder:text-secondary/45 focus-visible:border-primary"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 shrink-0 gap-2 bg-primary px-7 text-primary-foreground hover:bg-primary-hover"
                >
                  {t('sections.newsletter.button')}
                </Button>
              </div>

              <div aria-live="polite" className="min-h-5 text-xs">
                {error && (
                  <p className="text-red-300">{t('sections.newsletter.invalid')}</p>
                )}
                {subscribed && (
                  <p className="flex items-center gap-1.5 text-primary">
                    <CheckCircle2 size={14} />
                    {t('sections.newsletter.success')}
                  </p>
                )}
              </div>

              <p className="text-[11px] text-white/45">{t('sections.newsletter.privacy')}</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
