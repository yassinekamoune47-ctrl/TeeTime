import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Shield, Settings } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ProfileTab from '../components/ProfileTab';
import SecurityTab from '../components/SecurityTab';
import SettingsTab from '../components/SettingsTab';

type TabId = 'profile' | 'security' | 'settings';

export default function ProfilePage() {
  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: 'profile', label: t('profile.tabs.profile'), icon: User },
    { id: 'security', label: t('profile.tabs.security'), icon: Shield },
    { id: 'settings', label: t('profile.tabs.settings'), icon: Settings },
  ];

//   const roleLabel: Record<string, string> = {
//     PLAYER: 'Player',
//     MANAGER: 'Manager',
//     ADMIN: 'Admin',
//   };

  return (
    <div className="flex flex-col gap-6">

      <div className={`flex ${isDesktop ? 'flex-row' : 'flex-col'} gap-6`}>
        {/* Sidebar / Top buttons */}
        {isDesktop ? (
          <aside className="flex w-56 shrink-0 flex-col gap-1 rounded-lg border border-border bg-surface p-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-secondary'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-surface text-muted-foreground'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 rounded-lg border border-border bg-surface p-5">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}