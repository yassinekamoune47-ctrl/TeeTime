import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Building2, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MembershipSearchBarProps {
  onFiltersChange: (filters: {
    title: string;
    clubName: string;
    price: number | null;
  }) => void;
}

export default function MembershipSearchBar({ onFiltersChange }: MembershipSearchBarProps) {
  const { t } = useTranslation('memberships');

  const [title, setTitle]         = useState('');
  const [clubName, setClubName]   = useState('');
  const [price, setPrice]         = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fire debounced request whenever any filter changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFiltersChange({
        title,
        clubName,
        price: price !== '' && Number(price) > 0 ? Number(price) : null,
      });
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, clubName, price, onFiltersChange]);

  return (
    <div className="p-4 w-full md:p-6 flex flex-col gap-4">
      {/* Row 1: text inputs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Title */}
        <div className="relative">
          <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('search.offerNamePlaceholder', 'Offer name...')}
            className="pl-10 border border-primary placeholder:text-secondary"
          />
        </div>

        {/* Club name */}
        <div className="relative">
          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="text"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder={t('search.clubNamePlaceholder', 'Club name...')}
            className="pl-10 border border-primary placeholder:text-secondary"
          />
        </div>

        {/* Max price */}
        <div className="relative">
          <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={t('search.pricePlaceholder', 'Max price (MAD)...')}
            className="pl-10 border border-primary placeholder:text-secondary"
          />
        </div>
      </div>
    </div>
  );
}