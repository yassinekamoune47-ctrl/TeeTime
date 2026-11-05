import { useTranslation } from 'react-i18next';
import { MapPin, Building2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Membership } from '../types';

interface MembershipItemProps {
  membership: Membership;
  onClick: () => void;
}

const typeColors: Record<string, string> = {
  MONTHLY: 'bg-primary/15 text-primary border-primary',
  YEARLY: 'bg-secondary/15 text-secondary border-secondary',
  VIP: 'bg-primary text-primary-foreground border-primary',
};

export default function MembershipItem({ membership, onClick }: MembershipItemProps) {
  const { t } = useTranslation('memberships');

  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md md:flex-row md:items-center md:justify-between md:gap-4 md:p-5"
    >
      {/* Offer name + type badge */}
      <div className="flex items-center gap-3 md:flex-1">
        <div className="flex flex-col gap-1">
          <h3 className="font-serif text-lg font-bold text-secondary md:text-xl">
            {membership.title}
          </h3>
          <Badge className={`w-fit border text-xs ${typeColors[membership.status ?? ''] || typeColors.MONTHLY}`}>
            {t(`type.${membership.status}`)}
          </Badge>
        </div>
      </div>

      {/* Club + location — hidden on mobile, shown on desktop */}
      <div className="flex flex-col gap-1 text-sm md:flex-1">
        {membership.club?.name && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Building2 size={14} className="text-primary" />
            <span>{membership.club.name}</span>
          </div>
        )}
        {(membership.club?.city || membership.club?.address) && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin size={14} className="text-primary" />
            <span>{membership.club?.city || membership.club?.address}</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex items-center justify-between gap-2 md:flex-1 md:justify-end">
        <div className="flex flex-col">
          <span className="font-serif text-xl font-bold text-primary md:text-2xl">
            {membership.price} MAD
          </span>
          <span className="text-xs text-muted-foreground">
            {t('item.perYear')}
          </span>
        </div>
        <ChevronRight size={20} className="text-muted-foreground" />
      </div>
    </div>
  );
}