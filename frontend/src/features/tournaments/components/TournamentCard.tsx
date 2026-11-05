import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Trophy, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TOURNAMENT_STATUS_BADGES, TOURNAMENT_STATUS_KEYS } from '@/lib/constants';
import type { Tournament } from '../types';

interface TournamentCardProps {
  tournament: Tournament;
  onClick: () => void;
}

export default function TournamentCard({ tournament, onClick }: TournamentCardProps) {
  const { t } = useTranslation('tournaments');

  return (
    <Card
      className="overflow-hidden p-0 rounded-sm cursor-pointer transition-shadow hover:shadow-md md:h-full"
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Image */}
        <div className="relative w-full">
          <img
            src={tournament.image}
            alt={tournament.name}
            className="h-56 w-full object-cover md:h-64"
          />
          {/* Status badge — top right of image */}
          <Badge
            className={`absolute top-3 right-3 border ${TOURNAMENT_STATUS_BADGES[tournament.status]}`}
          >
            {t(`status.${TOURNAMENT_STATUS_KEYS[tournament.status]}`)}
          </Badge>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
          <h3 className="font-serif text-xl font-bold text-secondary md:text-2xl">
            {tournament.name}
          </h3>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} />
            <span>{tournament.location}</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar size={14} />
            <span>{tournament.date}</span>
          </div>

          {tournament.clubName && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Trophy size={12} className="text-primary" />
              <span>{tournament.clubName}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users size={12} className="text-primary" />
            <span>{t('card.capacity', { max: tournament.maxParticipants })}</span>
          </div>

          <p className="mt-auto font-serif text-2xl font-bold text-primary">
            {tournament.entryFee} MAD
            <span className="text-sm font-normal text-muted-foreground"> {t('card.entryFee')}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}