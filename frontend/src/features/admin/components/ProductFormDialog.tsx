import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRODUCT_CATEGORIES, type Product } from '@/features/shop/types';

interface ProductFormDialogProps {
  initial?: Product | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

export default function ProductFormDialog({
  initial,
  isSaving,
  onClose,
  onSubmit,
}: ProductFormDialogProps) {
  const { t } = useTranslation('shop');
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'ACCESSORIES');
  const [price, setPrice] = useState(initial?.price === null || initial?.price === undefined ? '' : String(initial.price));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const preview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return initial?.imageUrl ?? '';
  }, [imageFile, initial?.imageUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('category', category);
    formData.append('price', price.trim());
    formData.append('isActive', isActive ? '1' : '0');
    if (imageFile) formData.append('image', imageFile);

    onSubmit(formData);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-surface sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg text-secondary">
            {initial ? t('form.editTitle') : t('form.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-widest text-primary">{t('form.name')}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('form.namePlaceholder')}
              className="border-border"
              required
              maxLength={255}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-widest text-primary">{t('form.description')}</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('form.descriptionPlaceholder')}
              className="border-border"
              maxLength={1000}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-widest text-primary">{t('form.category')}</label>
              <Select value={category} onValueChange={(value) => setCategory(value ?? 'ACCESSORIES')}>
                <SelectTrigger className="w-full border-border">
                  <SelectValue>{t(`categories.${category}`, { defaultValue: category })}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(`categories.${key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-widest text-primary">{t('form.price')}</label>
              <Input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t('page.priceOnRequest')}
                className="border-border"
              />
              <p className="text-[11px] text-muted-foreground">{t('form.priceOnRequestHint')}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-widest text-primary">{t('form.image')}</label>
            <div className="flex items-center gap-3">
              {preview ? (
                <img
                  src={preview}
                  alt={name}
                  className="h-16 w-16 shrink-0 rounded-md border border-border object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                  <ImagePlus size={20} />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="border-border"
                />
                <span className="text-[11px] text-muted-foreground">{t('form.imageHint')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm text-foreground">{t('form.active')}</span>
            <Switch checked={isActive} onCheckedChange={(checked) => setIsActive(checked)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={isSaving || !name.trim()}>
              {isSaving ? t('form.saving') : t('form.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
