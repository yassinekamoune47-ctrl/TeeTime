import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Users, Flag } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export interface FilterValues {
  date: string;
  timeFrom: string;
  timeTo: string;
  players: string;
  holes: string;
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  showHoles?: boolean;
}

export default function FilterDialog({ open, onOpenChange, values, onChange, showHoles = true }: FilterDialogProps) {
  const { t } = useTranslation('clubs');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleChange = (field: keyof FilterValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  const filterFields = (
    <div className="flex flex-col gap-4">
      {/* Date */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-widest text-primary">{t('search.date')}</label>
        <div className="relative">
          <Calendar size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="date"
            value={values.date}
            onChange={(e) => handleChange('date', e.target.value)}
            placeholder={t('search.datePlaceholder')}
            className="pl-10 border border-primary placeholder:text-secondary"
          />
        </div>
      </div>

      {/* Time From */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-widest text-primary">{t('search.timeFrom')}</label>
        <div className="relative">
          <Clock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="time"
            value={values.timeFrom}
            onChange={(e) => handleChange('timeFrom', e.target.value)}
            placeholder={t('search.timeFromPlaceholder')}
            className="pl-10 border border-primary placeholder:text-secondary"
          />
        </div>
      </div>

      {/* Time To */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-widest text-primary">{t('search.timeTo')}</label>
        <div className="relative">
          <Clock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="time"
            value={values.timeTo}
            onChange={(e) => handleChange('timeTo', e.target.value)}
            placeholder={t('search.timeToPlaceholder')}
            className="pl-10 border border-primary placeholder:text-secondary"
          />
        </div>
      </div>

      {/* Players */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-widest text-primary">{t('search.players')}</label>
        <div className="relative">
          <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="number"
            min="1"
            value={values.players}
            onChange={(e) => handleChange('players', e.target.value)}
            placeholder={t('search.playersPlaceholder')}
            className="pl-10 border border-primary placeholder:text-secondary"
          />
        </div>
      </div>

      {/* Holes — only when showHoles is true */}
      {showHoles && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium tracking-widest text-primary">{t('search.holes')}</label>
          <div className="relative">
            <Flag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <Input
              type="number"
              min="1"
              value={values.holes}
              onChange={(e) => handleChange('holes', e.target.value)}
              placeholder={t('search.holesPlaceholder')}
              className="pl-10 border border-primary placeholder:text-secondary"
            />
          </div>
        </div>
      )}

      {/* Apply button */}
      <Button size="lg" className="mt-2 w-full" onClick={() => onOpenChange(false)}>
        {t('search.apply')}
      </Button>
    </div>
  );

  // ─── Desktop: centered Dialog ───
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-white">
          <h2 className="mb-4 font-serif text-xl font-bold text-secondary">{t('search.filter')}</h2>
          {filterFields}
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Mobile: bottom sheet Drawer ───
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-white">
        <div className="overflow-y-auto p-5">
          <h2 className="mb-4 font-serif text-xl font-bold text-secondary">{t('search.filter')}</h2>
          {filterFields}
        </div>
      </DrawerContent>
    </Drawer>
  );
}