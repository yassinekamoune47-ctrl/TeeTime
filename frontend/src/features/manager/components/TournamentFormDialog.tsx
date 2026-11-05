import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  EMPTY_TOURNAMENT_FORM_VALUES,
  validateTournamentForm,
  type TournamentFormErrors,
  type TournamentFormImage,
  type TournamentFormValues,
} from '../lib/tournamentForm';

interface TournamentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TournamentFormValues, image: TournamentFormImage) => void;
  initialValues?: TournamentFormValues;
  initialImageUrl?: string;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function TournamentForm({
  initialValues,
  initialImageUrl,
  onSubmit,
  onCancel,
}: {
  initialValues?: TournamentFormValues;
  initialImageUrl?: string;
  onSubmit: (values: TournamentFormValues, image: TournamentFormImage) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation('app');

  const [values, setValues] = useState<TournamentFormValues>(
    initialValues ?? EMPTY_TOURNAMENT_FORM_VALUES,
  );
  const [errors, setErrors] = useState<TournamentFormErrors>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialImageUrl ?? '');

  const setValue = (field: keyof TournamentFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateTournamentForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(values, {
      imageUrl: imagePreview || '/section1.png',
      imageFile: imageFile ?? undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('manageTournaments.form.name')}</Label>
        <Input value={values.name} onChange={(e) => setValue('name', e.target.value)} placeholder={t('manageTournaments.form.namePlaceholder')} className="border-border" />
        <FieldError message={errors.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('manageTournaments.form.description')}</Label>
        <textarea value={values.description} onChange={(e) => setValue('description', e.target.value)} placeholder={t('manageTournaments.form.descriptionPlaceholder')} rows={3} className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('manageTournaments.form.date')}</Label>
          <Input type="date" value={values.date} onChange={(e) => setValue('date', e.target.value)} className="border-border" />
          <FieldError message={errors.date} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('manageTournaments.form.location')}</Label>
          <Input value={values.location} onChange={(e) => setValue('location', e.target.value)} placeholder={t('manageTournaments.form.locationPlaceholder')} className="border-border" />
          <FieldError message={errors.location} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('manageTournaments.form.entryFee')}</Label>
          <Input type="number" min="0" step="0.01" value={values.entryFee} onChange={(e) => setValue('entryFee', e.target.value)} placeholder="800" className="border-border" />
          <FieldError message={errors.entryFee} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-secondary">{t('manageTournaments.form.maxParticipants')}</Label>
          <Input type="number" min="1" step="1" value={values.maxParticipants} onChange={(e) => setValue('maxParticipants', e.target.value)} placeholder="60" className="border-border" />
          <FieldError message={errors.maxParticipants} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm text-secondary">{t('manageTournaments.form.image')}</Label>
        <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} className="border-border" />
        {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 h-32 w-full object-cover rounded" />}
      </div>

      {!initialValues && (
        <p className="rounded-lg border border-border bg-muted/10 p-3 text-xs text-muted-foreground">
          {t('manageTournaments.form.draftNotice')}
        </p>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1 border-border" onClick={onCancel}>
          {t('manageTournaments.form.cancel')}
        </Button>
        <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          {t('manageTournaments.form.save')}
        </Button>
      </div>
    </form>
  );
}

export default function TournamentFormDialog({ open, onOpenChange, onSubmit, initialValues, initialImageUrl }: TournamentFormDialogProps) {
  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const title = initialValues ? t('manageTournaments.form.editTitle') : t('manageTournaments.form.createTitle');
  const form = (
    <TournamentForm
      key={`${initialValues?.name ?? 'new'}-${open}`}
      initialValues={initialValues}
      initialImageUrl={initialImageUrl}
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
