import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getApiErrorMessage } from '@/lib/apiError';
import { useUpdateProductVariants } from '@/features/shop/hooks/useShop';
import type { Product } from '@/features/shop/types';

interface ProductVariantsDialogProps {
  product: Product;
  onClose: () => void;
}

interface VariantRow {
  key: string;
  size: string;
  color: string;
  stock: string;
}

export default function ProductVariantsDialog({ product, onClose }: ProductVariantsDialogProps) {
  const { t } = useTranslation('shop');
  const mutation = useUpdateProductVariants();
  const [rows, setRows] = useState<VariantRow[]>(() =>
    (product.variants ?? []).map((variant) => ({
      key: variant.id,
      size: variant.size,
      color: variant.color,
      stock: String(variant.stock),
    })),
  );

  const updateRow = (key: string, field: 'size' | 'color' | 'stock', value: string) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  };

  const addRow = () => {
    setRows((current) => [
      ...current,
      { key: crypto.randomUUID(), size: '', color: '', stock: '0' },
    ]);
  };

  const removeRow = (key: string) => {
    setRows((current) => current.filter((row) => row.key !== key));
  };

  const handleSave = () => {
    const cleaned = rows.map((row) => ({
      size: row.size.trim(),
      color: row.color.trim(),
      stock: Number(row.stock),
    }));

    const invalid = cleaned.some(
      (row) => !row.size || !row.color || !Number.isInteger(row.stock) || row.stock < 0,
    );

    if (invalid) {
      toast.error(t('manage.variantsInvalid'));
      return;
    }

    const combos = cleaned.map((row) => `${row.size.toLowerCase()}|${row.color.toLowerCase()}`);
    if (new Set(combos).size !== combos.length) {
      toast.error(t('manage.variantsDuplicate'));
      return;
    }

    mutation.mutate(
      { id: product.id, variants: cleaned },
      {
        onSuccess: () => {
          toast.success(t('manage.variantsSaved'));
          onClose();
        },
        onError: (err) => toast.error(getApiErrorMessage(err, t('manage.variantsError'))),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg text-secondary">
            {t('manage.variantsTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('manage.variantsDescription', { name: product.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {rows.length > 0 && (
            <div className="grid grid-cols-[1fr_1fr_90px_36px] gap-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
              <span>{t('manage.size')}</span>
              <span>{t('manage.color')}</span>
              <span>{t('manage.stock')}</span>
              <span />
            </div>
          )}

          {rows.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
              {t('manage.variantsEmpty')}
            </p>
          ) : (
            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
              {rows.map((row) => (
                <div key={row.key} className="grid grid-cols-[1fr_1fr_90px_36px] items-center gap-2">
                  <Input
                    value={row.size}
                    onChange={(e) => updateRow(row.key, 'size', e.target.value)}
                    placeholder={t('manage.sizePlaceholder')}
                    maxLength={20}
                    aria-label={t('manage.size')}
                    className="h-9 border-border"
                  />
                  <Input
                    value={row.color}
                    onChange={(e) => updateRow(row.key, 'color', e.target.value)}
                    placeholder={t('manage.colorPlaceholder')}
                    maxLength={40}
                    aria-label={t('manage.color')}
                    className="h-9 border-border"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={row.stock}
                    onChange={(e) => updateRow(row.key, 'stock', e.target.value)}
                    aria-label={t('manage.stock')}
                    className="h-9 border-border"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRow(row.key)}
                    aria-label={t('manage.remove')}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button type="button" variant="outline" size="sm" className="w-fit gap-2" onClick={addRow}>
            <Plus size={14} />
            {t('manage.addVariant')}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            {t('manage.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending ? t('manage.saving') : t('manage.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
