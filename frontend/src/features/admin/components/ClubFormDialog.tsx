import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {useDataManagers} from "@/features/admin/hooks/useDataManagers.ts";
import {useCreateClub} from "@/features/admin/hooks/useCreateClub.ts";
import type {ManagerListProps} from "@/features/manager/types.ts";
import type {CreateClub} from "@/features/clubs/types.ts";
import cities from "@/data/cities.json";

interface ClubFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ClubFormDialog({ open, onOpenChange }: ClubFormDialogProps) {
  const { t } = useTranslation('app');
  const { data } = useDataManagers();
  const createClub = useCreateClub();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [newClub, setNewClub] = useState<CreateClub>({
      name: '',
      city: '',
      address: '',
      ownerId: null,
  });

  const managers : ManagerListProps[] = data?.pages.flatMap(p => p) ?? [];

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewClub({
        name: '',
        city: '',
        address: '',
        ownerId: null,
      });
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClub.mutate(
        {
          name: newClub.name,
          city: newClub.city,
          address: newClub.address,
          ownerId: newClub.ownerId,
        },
        {
          onSuccess: () => {
            onOpenChange(false); // close dialog
          },
        }
    )
  };

  const formFields = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('clubsManagement.form.name')}</Label>
        <Input value={newClub.name} onChange={(e) => setNewClub({...newClub, name: e.target.value})} placeholder={t('clubsManagement.form.namePlaceholder')} className="border-border" required />
      </div>

        <div className="flex flex-col gap-1">
            <Label className="text-sm text-secondary">{t('clubsManagement.form.city')}</Label>
            <Select value={newClub.city || null} onValueChange={(v) => setNewClub({ ...newClub, city: v ?? '' })}>
                <SelectTrigger size="sm" className="w-full border-border">
                    {/* Base UI's SelectValue doesn't resolve labels — render the selected city explicitly */}
                    <SelectValue>
                        {newClub.city || t('clubsManagement.city')}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {cities.map((city) => (
                        <SelectItem key={city.id} value={city.ville}>
                            {city.ville}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('clubsManagement.form.address')}</Label>
        <Input value={newClub.address} onChange={(e) => setNewClub({...newClub, address: e.target.value})} placeholder={t('clubsManagement.form.addressPlaceholder')} className="border-border" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('clubsManagement.form.owner')}</Label>
        <Select value={newClub.ownerId} onValueChange={(v) => setNewClub({...newClub, ownerId: v ?? null})}>
          <SelectTrigger className="w-full border-border">
            {/* Base UI's SelectValue renders the raw value (the manager UUID),
                so we render the manager's name explicitly */}
            <SelectValue>
              {newClub.ownerId == null
                ? t('clubsManagement.form.noOwner')
                : (() => {
                    const selectedManager = managers.find((m) => m.id === newClub.ownerId);
                    return selectedManager
                      ? `${selectedManager.firstName} ${selectedManager.lastName}`
                      : newClub.ownerId;
                  })()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>{t('clubsManagement.form.noOwner')}</SelectItem>
            {managers.map((m: ManagerListProps) => (
              <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1 border-border" onClick={() => onOpenChange(false)}>
          {t('clubsManagement.form.cancel')}
        </Button>
        <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {t('clubsManagement.form.save')}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg bg-surface max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold text-secondary">
              {t('clubsManagement.form.createTitle')}
            </DialogTitle>
          </DialogHeader>
          {formFields}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="max-h-[90vh] bg-surface">
        <DrawerHeader>
          <DrawerTitle className="font-serif text-lg font-bold text-secondary">
            {t('clubsManagement.form.createTitle')}
          </DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6 max-h-[75vh]">{formFields}</div>
      </DrawerContent>
    </Drawer>
  );
}