import { useTranslation } from 'react-i18next';
import { Sun, Moon } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useThemeStore } from '@/store/theme.store';

export default function SettingsTab() {
  const { t, i18n } = useTranslation('app');
  const { theme, toggleTheme } = useThemeStore();

  const handleLanguageChange = (value: string | null) => {
    if (value) {
      i18n.changeLanguage(value);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* System */}
      <div className="flex flex-col gap-4">
        <h3 className="font-serif text-base font-bold text-secondary">
          {t('profile.settingsTab.system')}
        </h3>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-secondary">{t('profile.settingsTab.language')}</span>
          <Select value={i18n.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-secondary">{t('profile.settingsTab.theme')}</span>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-secondary transition-colors hover:bg-muted"
          >
            {theme === 'light' ? <Sun size={16} className="text-primary" /> : <Moon size={16} className="text-primary" />}
            {theme === 'light' ? t('profile.settingsTab.light') : t('profile.settingsTab.dark')}
          </button>
        </div>
      </div>
    </div>
  );
}