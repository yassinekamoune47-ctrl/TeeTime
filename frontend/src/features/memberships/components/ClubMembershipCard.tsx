import { useTranslation } from 'react-i18next';
import { MapPin, Tag, Phone, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ClubMembershipGroup, Membership } from '../types';

interface ClubMembershipCardProps {
  club: ClubMembershipGroup['club'];
  memberships: Membership[];
  expanded: boolean;
  onToggle: () => void;
  onSelect: (membership: Membership) => void;
}

export default function ClubMembershipCard({
  club,
  memberships,
  expanded,
  onToggle,
  onSelect,
}: ClubMembershipCardProps) {
  const { t } = useTranslation('memberships');

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-surface transition-shadow',
        expanded ? 'border-primary/40 shadow-md' : 'border-border hover:shadow-md',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-4 p-4 text-left md:p-5"
      >
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
          <img
            src={club.coverURL || club.logoURL || '/teetime-logo.png'}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="truncate font-serif text-lg font-bold text-secondary md:text-xl">
            {club.name}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground md:text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-primary" />
              {club.city}
            </span>
            {memberships.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Tag size={13} className="text-primary" />
                {t('club.offers', { count: memberships.length })}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          size={20}
          className={cn(
            'shrink-0 text-primary transition-transform duration-300',
            expanded && 'rotate-180',
          )}
        />
      </button>

      <div
        aria-hidden={!expanded}
        inert={!expanded}
        className={cn(
          'grid transition-all duration-300 ease-out',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border">
            {memberships.length === 0 ? (
              <div className="flex flex-col gap-1 p-4 md:p-5">
                <p className="text-sm text-muted-foreground">{t('club.noOffers')}</p>
                <p className="text-xs text-muted-foreground">{t('club.noOffersHint')}</p>
                {club.phone && (
                  <a
                    href={`tel:${club.phone}`}
                    className="mt-1 flex w-fit items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover"
                  >
                    <Phone size={13} />
                    {club.phone}
                  </a>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {memberships.map((membership) => (
                  <li
                    key={membership.id}
                    className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:gap-4 md:p-5"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h4 className="font-serif text-base font-bold text-secondary md:text-lg">
                        {membership.title}
                      </h4>
                      {membership.description && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {membership.description}
                        </p>
                      )}
                      {membership.benefits?.length > 0 && (
                        <p className="text-xs text-primary">
                          {membership.benefits.join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <div className="flex flex-col items-start md:items-end">
                        <span className="font-serif text-lg font-bold text-primary md:text-xl">
                          {membership.price} MAD
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t('item.perYear')}
                        </span>
                      </div>
                      <Button size="sm" onClick={() => onSelect(membership)}>
                        {t('club.select')}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
