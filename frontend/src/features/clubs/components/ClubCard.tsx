import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MapPin, Flag, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Club } from '../types';

interface ClubCardProps {
  club: Club;
}

export default function ClubCard({ club }: ClubCardProps) {
  const { t } = useTranslation('clubs');
  const navigate = useNavigate();

  return (
    <Card
      className="overflow-visible p-0 rounded-sm cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => navigate(`/reservations/${club.id}`)}
    >
      {/* Cover image — short */}
      <div className="relative h-20 w-full overflow-hidden rounded-t-sm">
        <img
          src={club.coverURL}
          alt={club.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Logo — centered, overlapping cover */}
      <div className="flex justify-center">
        <img
          src={club.logoURL}
          alt={club.name}
          className="h-16 w-16 -translate-y-8 rounded-full border-4 border-background object-cover bg-background"
        />
      </div>

      {/* Info — pulled up to close gap */}
      <div className="flex flex-col gap-2 px-4 pb-4 -mt-4">
        <h3 className="text-center font-serif text-lg font-bold text-secondary">
          {club.name}
        </h3>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <MapPin size={12} />
          <span>{club.city}</span>
        </div>

        <p className="text-center text-xs text-muted-foreground line-clamp-2">{club.description}</p>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Flag size={12} className="text-primary" />
          <span>{club.courses.length} {t('club.courses')}</span>
        </div>

        <div className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-primary">
          {t('club.viewCourses')}
          <ChevronRight size={14} />
        </div>
      </div>
    </Card>
  );
}