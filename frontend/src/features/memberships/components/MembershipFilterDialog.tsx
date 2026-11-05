import { useTranslation } from 'react-i18next';
import { MapPin, Tag } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export interface MembershipFilterValues {
  location: string;
  type: string;
}

interface MembershipFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: MembershipFilterValues;
  onChange: (values: MembershipFilterValues) => void;
}

export default function MembershipFilterDialog({ open, onOpenChange, values, onChange }: MembershipFilterDialogProps) {
  const { t } = useTranslation('memberships');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleChange = (field: keyof MembershipFilterValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  const filterFields = (
    <div className="flex flex-col gap-4">
      {/* Location */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-widest text-primary">{t('search.location')}</label>
        <div className="relative">
          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="text"
            value={values.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder={t('search.locationPlaceholder')}
            className="pl-10 border border-primary placeholder:text-secondary"
          />
        </div>
      </div>

      {/* Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-widest text-primary">{t('search.type')}</label>
        <Select value={values.type} onValueChange={(v) => handleChange('type', v ?? '')}>
          <SelectTrigger className="w-full border-primary text-secondary">
            <Tag size={18} className="text-secondary" />
            <SelectValue placeholder={t('search.typePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">{t('type.ACTIVE', 'Active')}</SelectItem>
            <SelectItem value="SUSPENDED">{t('type.SUSPENDED', 'Suspended')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Apply button */}
      <Button size="lg" className="mt-2 w-full" onClick={() => onOpenChange(false)}>
        {t('search.apply')}
      </Button>
    </div>
  );

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