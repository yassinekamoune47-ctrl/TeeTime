import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface LogEntry {
  id: string;
  icon: string;
  type: 'clubApproved' | 'userRegistered' | 'newReservations' | 'userSuspended' | 'tournamentStarted' | 'clubSubmitted';
  text: string;
  actor: string;
  time: string;
}

const mockLog: LogEntry[] = [
  { id: '1', icon: '✅', type: 'clubApproved', text: '"Golf du Maroc"', actor: 'admin', time: '2h' },
  { id: '2', icon: '👤', type: 'userRegistered', text: '"youssef.alaoui"', actor: 'system', time: '3h' },
  { id: '3', icon: '📅', type: 'newReservations', text: '14 nouvelles aujourd\'hui', actor: 'system', time: '5h' },
  { id: '4', icon: '⛔', type: 'userSuspended', text: '"spammer123"', actor: 'admin', time: '6h' },
  { id: '5', icon: '🏆', type: 'tournamentStarted', text: '"Summer Open"', actor: 'ahmed.b', time: '8h' },
  { id: '6', icon: '🏌️', type: 'clubSubmitted', text: '"Golf de Marrakech"', actor: 'karim.e', time: '12h' },
  { id: '7', icon: '✅', type: 'clubApproved', text: '"Golf de Tanger"', actor: 'admin', time: '1j' },
  { id: '8', icon: '👤', type: 'userRegistered', text: '"sara.m"', actor: 'system', time: '1j' },
  { id: '9', icon: '⛔', type: 'userSuspended', text: '"fake_user"', actor: 'admin', time: '2j' },
  { id: '10', icon: '🏆', type: 'tournamentStarted', text: '"Winter Cup"', actor: 'sara.m', time: '2j' },
  { id: '11', icon: '📅', type: 'newReservations', text: '22 nouvelles hier', actor: 'system', time: '2j' },
  { id: '12', icon: '👤', type: 'userRegistered', text: '"omar.f"', actor: 'system', time: '3j' },
  { id: '13', icon: '🏌️', type: 'clubSubmitted', text: '"Ocean Golf"', actor: 'hassan.t', time: '3j' },
  { id: '14', icon: '✅', type: 'clubApproved', text: '"Palmeraie Golf"', actor: 'admin', time: '4j' },
  { id: '15', icon: '⛔', type: 'userSuspended', text: '"bot_account"', actor: 'admin', time: '5j' },
];

export default function AdminActivityLog() {
  const { t } = useTranslation('app');

  return (
    <Card className="flex flex-col p-4">
      <h3 className="mb-3 text-xs font-medium tracking-widest text-primary">
        {t('dashboard.admin.activityLog.title')}
      </h3>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto" style={{ maxHeight: '400px' }}>
        {mockLog.map((entry) => (
          <div key={entry.id} className="flex items-center gap-3 text-sm">
            <span className="text-base">{entry.icon}</span>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-secondary">
                {t(`dashboard.admin.activityLog.${entry.type}`)} {entry.text}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('dashboard.admin.activityLog.by')} {entry.actor} · il y a {entry.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline">
        {t('dashboard.admin.activityLog.viewAll')}
        <ChevronRight size={14} />
      </button>
    </Card>
  );
}