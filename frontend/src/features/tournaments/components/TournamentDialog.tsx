import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Trophy, Users, Flag } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { TOURNAMENT_STATUS_BADGES, TOURNAMENT_STATUS_KEYS } from '@/lib/constants';
import type { Tournament } from '../types';

interface TournamentDialogProps {
  tournament: Tournament | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TournamentDialog({ tournament, open, onOpenChange }: TournamentDialogProps) {
  const { t } = useTranslation('tournaments');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (!tournament) return null;

  const details = (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
        <Calendar size={16} className="text-primary" />
        <span className="text-xs text-muted-foreground">{t('dialog.date')}</span>
        <span className="text-sm font-semibold text-foreground">{tournament.date}</span>
      </div>
      <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
        <MapPin size={16} className="text-primary" />
        <span className="text-xs text-muted-foreground">{t('dialog.location')}</span>
        <span className="text-sm font-semibold text-foreground">{tournament.location}</span>
      </div>
      {tournament.clubName && (
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <Trophy size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('dialog.club')}</span>
          <span className="text-sm font-semibold text-foreground">{tournament.clubName}</span>
        </div>
      )}
      <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
        <Users size={16} className="text-primary" />
        <span className="text-xs text-muted-foreground">{t('dialog.capacity')}</span>
        <span className="text-sm font-semibold text-foreground">{tournament.maxParticipants}</span>
      </div>
      <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
        <Flag size={16} className="text-primary" />
        <span className="text-xs text-muted-foreground">{t('dialog.entryFee')}</span>
        <span className="text-xl font-serif font-bold text-primary">{tournament.entryFee} MAD</span>
      </div>
      <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
        <span className="text-xs text-muted-foreground">{t('dialog.status')}</span>
        <Badge className={`w-fit border ${TOURNAMENT_STATUS_BADGES[tournament.status]}`}>
          {t(`status.${TOURNAMENT_STATUS_KEYS[tournament.status]}`)}
        </Badge>
      </div>
    </div>
  );

  const content = (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-secondary sm:text-3xl">{tournament.name}</h2>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{tournament.description}</p>
      </div>
      <div>{details}</div>
    </div>
  );

  // ─── Desktop: centered Dialog ───
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[75vh] overflow-hidden p-0 sm:max-w-4xl bg-white">
          <div className="flex flex-col md:flex-row h-full">
            <div className="relative h-64 w-full md:h-auto md:w-5/12 md:min-h-140">
              <img src={tournament.image} alt={tournament.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
              {content}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Mobile: bottom sheet Drawer ───
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] bg-white">
        <div className="flex flex-col overflow-y-auto">
          <div className="relative h-56 w-full shrink-0">
            <img src={tournament.image} alt={tournament.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-1 flex-col gap-5 p-5">
            {content}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}