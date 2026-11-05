import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAddMembership } from '../hooks/useAddMembership';

export interface OfferFormData {
  title: string;
  description: string;
  price: number;
  benefits: string[];
}

interface OfferFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function OfferForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) {
  const { t } = useTranslation('app');
  const addMembership = useAddMembership();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [benefits, setBenefits] = useState<string[]>(['']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMembership.mutate(
      {
        title,
        description,
        price: Number(price) || 0,
        benefits: benefits.map((b) => b.trim()).filter(Boolean),
      },
      { onSuccess: onCreated },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('members.offer.form.name')}</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('members.offer.form.namePlaceholder')} className="border-border" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('members.offer.form.description')}</Label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('members.offer.form.descriptionPlaceholder')} rows={3} className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('members.offer.form.price')}</Label>
        <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="12000" className="border-border" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('members.offer.form.benefits')}</Label>
        <div className="flex flex-row gap-2">
          <Input
            value={benefits[0] ?? ''}
            onChange={(e) => {
              const next = [...benefits];
              next[0] = e.target.value;
              setBenefits(next);
            }}
            placeholder={t('members.offer.form.benefitsPlaceholder')}
            className="border-border"
          />
          <Button type="button" className="bg-secondary w-8 shrink-0" onClick={() => setBenefits([...benefits, ''])}>
            +
          </Button>
        </div>
      </div>
      {benefits.slice(1).map((b, idx) => {
        const realIdx = idx + 1;
        return (
          <div key={realIdx} className="flex flex-row gap-2">
            <Input
              value={b}
              onChange={(e) => {
                const next = [...benefits];
                next[realIdx] = e.target.value;
                setBenefits(next);
              }}
              placeholder={t('members.offer.form.benefitsPlaceholder')}
              className="border-border"
            />
            <Button
              type="button"
              className="bg-red-500 w-8 shrink-0 hover:bg-red-600"
              onClick={() => setBenefits(benefits.filter((_, i) => i !== realIdx))}
            >
              -
            </Button>
          </div>
        );
      })}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1 border-border" onClick={onCancel}>
          {t('members.offer.form.cancel')}
        </Button>
        <Button type="submit" disabled={addMembership.isPending} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {addMembership.isPending ? '...' : t('members.offer.form.save')}
        </Button>
      </div>
    </form>
  );
}

export default function OfferFormDialog({ open, onOpenChange }: OfferFormDialogProps) {
  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-surface max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold text-secondary">
              {t('members.offer.form.title')}
            </DialogTitle>
          </DialogHeader>
          <OfferForm onCancel={() => onOpenChange(false)} onCreated={() => onOpenChange(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] bg-surface">
        <DrawerHeader>
          <DrawerTitle className="font-serif text-lg font-bold text-secondary">
            {t('members.offer.form.title')}
          </DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6 max-h-[75vh]">
          <OfferForm onCancel={() => onOpenChange(false)} onCreated={() => onOpenChange(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
