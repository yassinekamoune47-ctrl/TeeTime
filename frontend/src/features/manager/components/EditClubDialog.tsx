import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type {ClubFormData} from "@/features/clubs/types.ts";
import {useUpdateClubData} from "@/features/manager/hooks/useUpdateClubData.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import cities from "@/data/cities.json";

interface EditClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: ClubFormData;
}

export default function EditClubDialog({ open, onOpenChange, initialData }: EditClubDialogProps) {
  const { t } = useTranslation('app');

  const updateClub = useUpdateClubData();

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [form, setForm] = useState<ClubFormData>(initialData);

  const update = (key: keyof ClubFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
      console.log(initialData);
    e.preventDefault();
    updateClub.mutate(form);
    onOpenChange(false);
  };

  const formFields = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('myClub.editForm.name')}</Label>
        <Input value={form.name} onChange={(e) => update('name', e.target.value)} className="border-border" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('myClub.editForm.description')}</Label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('myClub.editForm.logo')}</Label>
          <Input type="file" onChange={(e) => e.target.files && setForm({ ...form, logo: e.target.files[0] })} className="border-border" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('myClub.editForm.coverImage')}</Label>
          <Input type="file" onChange={(e) => e.target.files && setForm({ ...form, cover: e.target.files[0] })} className="border-border" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('myClub.editForm.phone')}</Label>
          <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="border-border" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('myClub.editForm.email')}</Label>
          <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="border-border" />
        </div>
      </div>

        <div>
            <Select value={form.city} onValueChange={(v) => update('city', v ?? '')}>
                <SelectTrigger size="sm" className="w-full border-border">
                    <SelectValue>
                        {form.city ? form.city : t('clubsManagement.city')}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">{t('clubsManagement.city')}</SelectItem>
                    {cities.map((city) => (
                        <SelectItem key={city.id} value={city.ville}>
                            {city.ville}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('myClub.editForm.address')}</Label>
        <Input value={form.address} onChange={(e) => update('address', e.target.value)} className="border-border" />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 border-border">
          {t('myClub.editForm.cancel')}
        </Button>
        <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {t('myClub.editForm.save')}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg bg-surface max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold text-secondary">
              {t('myClub.editForm.title')}
            </DialogTitle>
          </DialogHeader>
          {formFields}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] bg-surface">
        <DrawerHeader>
          <DrawerTitle className="font-serif text-lg font-bold text-secondary">
            {t('myClub.editForm.title')}
          </DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6 max-h-[80vh]">
          {formFields}
        </div>
      </DrawerContent>
    </Drawer>
  );
}