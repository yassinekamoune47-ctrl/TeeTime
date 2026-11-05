import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  const { t } = useTranslation('auth');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        

        {/* Card */}
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm md:p-8">
        {/* Logo */}
        <div className="mb-2 text-center">
          <Link to="/">
            <img src="/teetime-logo.png" alt="TeeTime Executive" className="mx-auto h-12 w-auto rounded-lg" />
          </Link>
        </div>
          <div className="mb-6 text-center">
            <h1 className="font-serif text-2xl font-bold text-secondary md:text-3xl">
              {t('register.title')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('register.subtitle')}</p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}