import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PendingAction {
  id: string;
  type: 'club' | 'user' | 'tournament' | 'membership';
  icon: string;
  description: string;
  club?: string;
  created: string;
}

const mockActions: PendingAction[] = [
  { id: '1', type: 'club', icon: '🏌️', description: 'Royal Golf Dar Es Salam — Nouvelle soumission', created: '3j' },
  { id: '2', type: 'user', icon: '👤', description: 'spammer123 — Activité suspecte', created: '1j' },
  { id: '3', type: 'tournament', icon: '🏆', description: 'Summer Open — À démarrer', club: 'Golf du Palais Royal', created: '5h' },
  { id: '4', type: 'club', icon: '🏌️', description: 'Royal Golf Marrakech — Sans gestionnaire', created: '2j' },
  { id: '5', type: 'membership', icon: '📋', description: 'Sara M. — Adhésion Royal Golf Anfa Mohammedia', club: 'Royal Golf Anfa Mohammedia', created: '6h' },
];

export default function AdminPendingActions() {
  const { t } = useTranslation('app');
  const [actions, setActions] = useState(mockActions);

  const handleApprove = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    toast.success(t('dashboard.admin.pendingActions.approve'));
  };

  const handleReject = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    toast.success(t('dashboard.admin.pendingActions.reject'));
  };

  return (
    <Card className="flex flex-col p-4">
      <h3 className="mb-3 text-xs font-medium tracking-widest text-primary">
        {t('dashboard.admin.pendingActions.title')}
      </h3>

      <div className="flex flex-1 flex-col gap-2">
        {actions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">—</p>
        ) : (
          actions.map((action) => (
            <div key={action.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <span className="text-lg">{action.icon}</span>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium text-secondary">{action.description}</span>
                <span className="text-xs text-muted-foreground">
                  {t(`dashboard.admin.pendingActions.${action.type}`)}
                  {action.club && ` · ${action.club}`}
                  {` · il y a ${action.created}`}
                </span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" className="h-7 bg-secondary px-2 text-white hover:bg-secondary/80" onClick={() => handleApprove(action.id)}>
                  <Check size={14} />
                </Button>
                <Button size="sm" variant="outline" className="h-7 border-border px-2 text-muted-foreground hover:bg-muted" onClick={() => handleReject(action.id)}>
                  <X size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline">
        {t('dashboard.admin.pendingActions.viewAll')}
        <ChevronRight size={14} />
      </button>
    </Card>
  );
}