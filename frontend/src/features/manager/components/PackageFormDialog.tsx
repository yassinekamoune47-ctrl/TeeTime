import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export interface PackageFormData {
  name: string;
  description: string;
  clubName: string;
  price: number;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructor: string;
  startDate: string;
  endDate: string;
  image: string;
}

interface PackageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PackageFormData) => void;
  initialData?: PackageFormData;
}

function PackageForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: PackageFormData;
  onSubmit: (data: PackageFormData) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation('app');

  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [clubName, setClubName] = useState(initialData?.clubName ?? '');
  const [price, setPrice] = useState(initialData ? String(initialData.price) : '');
  const [duration, setDuration] = useState(initialData?.duration ?? '');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(initialData?.level ?? 'beginner');
  const [instructor, setInstructor] = useState(initialData?.instructor ?? '');
  const [startDate, setStartDate] = useState(initialData?.startDate ?? '');
  const [endDate, setEndDate] = useState(initialData?.endDate ?? '');
  const [image, setImage] = useState(initialData?.image ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      clubName,
      price: Number(price) || 0,
      duration,
      level,
      instructor,
      startDate,
      endDate,
      image: image || '/section1.png',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('managePackages.package.form.name')}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('managePackages.package.form.namePlaceholder')} className="border-border" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('managePackages.package.form.description')}</Label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('managePackages.package.form.descriptionPlaceholder')} rows={3} className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('managePackages.package.form.clubName')}</Label>
        <Input value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder={t('managePackages.package.form.clubNamePlaceholder')} className="border-border" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('managePackages.package.form.price')}</Label>
          <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2500" className="border-border" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('managePackages.package.form.duration')}</Label>
          <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder={t('managePackages.package.form.durationPlaceholder')} className="border-border" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('managePackages.package.form.level')}</Label>
          <Select value={level} onValueChange={(v) => setLevel((v ?? 'beginner') as 'beginner' | 'intermediate' | 'advanced')}>
            <SelectTrigger className="w-full border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">{t('managePackages.package.levelBeginner')}</SelectItem>
              <SelectItem value="intermediate">{t('managePackages.package.levelIntermediate')}</SelectItem>
              <SelectItem value="advanced">{t('managePackages.package.levelAdvanced')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('managePackages.package.form.instructor')}</Label>
          <Input value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder={t('managePackages.package.form.instructorPlaceholder')} className="border-border" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('managePackages.package.form.startDate')}</Label>
          <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder={t('managePackages.package.form.startDatePlaceholder')} className="border-border" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('managePackages.package.form.endDate')}</Label>
          <Input value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder={t('managePackages.package.form.endDatePlaceholder')} className="border-border" required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('managePackages.package.form.image')}</Label>
        <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder={t('managePackages.package.form.imagePlaceholder')} className="border-border" />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1 border-border" onClick={onCancel}>
          {t('managePackages.package.form.cancel')}
        </Button>
        <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {t('managePackages.package.form.save')}
        </Button>
      </div>
    </form>
  );
}

export default function PackageFormDialog({ open, onOpenChange, onSubmit, initialData }: PackageFormDialogProps) {
  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const title = initialData ? t('managePackages.package.form.editTitle') : t('managePackages.package.form.createTitle');
  const form = (
    <PackageForm
      key={initialData?.name ?? 'new'}
      initialData={initialData}
      onSubmit={onSubmit}
      onCancel={() => onOpenChange(false)}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-surface max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold text-secondary">{title}</DialogTitle>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] bg-surface">
        <DrawerHeader>
          <DrawerTitle className="font-serif text-lg font-bold text-secondary">{title}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6 max-h-[75vh]">{form}</div>
      </DrawerContent>
    </Drawer>
  );
}
