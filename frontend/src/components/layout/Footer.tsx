import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation('landing');

  return (
    <footer className="bg-secondary text-secondary-foreground p-4">
      <div className="mx-auto flex flex-col max-w-7xl gap-6 px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
            <img src="/teetime-logo.png" alt="TeeTime Executive" className="h-12 w-auto rounded-md md:h-20" />
        </div>
        <p className="text-md text-secondary-foreground/60">
            {t('footer.description')}
        </p>

        <hr></hr>

        <p className="text-md text-secondary-foreground/60">
            {t('footer.rights', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}