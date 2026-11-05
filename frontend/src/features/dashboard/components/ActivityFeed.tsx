import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Activity {
  id: string;
  icon: string;
  type: 'reservationConfirmed' | 'reservationPending' | 'newMember' | 'slotBlocked' | 'tournamentCreated';
  text: string;
  time: string;
}

const mockActivity: Activity[] = [
  { id: '1', icon: '✅', type: 'reservationConfirmed', text: 'Ahmed B. — 09:30', time: '5 min' },
  { id: '2', icon: '🟡', type: 'reservationPending', text: 'Youssef K. — 10:00', time: '12 min' },
  { id: '3', icon: '👤', type: 'newMember', text: 'Sara M.', time: '1h' },
  { id: '4', icon: '⛔', type: 'slotBlocked', text: '14:00', time: '2h' },
  { id: '5', icon: '🏆', type: 'tournamentCreated', text: '"Summer Open"', time: '3h' },
  { id: '6', icon: '✅', type: 'reservationConfirmed', text: 'Karim E. — 13:00', time: '4h' },
  { id: '7', icon: '👤', type: 'newMember', text: 'Omar F.', time: '5h' },
  { id: '8', icon: '🟡', type: 'reservationPending', text: 'Nadia L. — 15:00', time: '6h' },
  { id: '9', icon: '✅', type: 'reservationConfirmed', text: 'Hassan T. — 16:00', time: '7h' },
  { id: '10', icon: '⛔', type: 'slotBlocked', text: '12:00', time: '8h' },
];

export default function ActivityFeed() {
  const { t } = useTranslation('app');

  return (
    <Card className="flex flex-col p-4">
      <h3 className="mb-3 text-xs font-medium tracking-widest text-primary">
        {t('dashboard.manager.activityFeed.title')}
      </h3>

      <div className="flex flex-1 flex-col gap-2.5">
        {mockActivity.map((a) => (
          <div key={a.id} className="flex items-center gap-3 text-sm">
            <span className="text-base">{a.icon}</span>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-secondary">
                {t(`dashboard.manager.activityFeed.${a.type}`)}
              </span>
              <span className="text-xs text-muted-foreground">{a.text}</span>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">il y a {a.time}</span>
          </div>
        ))}
      </div>

      <button className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline">
        {t('dashboard.manager.activityFeed.viewAll')}
        <ChevronRight size={14} />
      </button>
    </Card>
  );
}