import { useTranslation } from 'react-i18next';
import type { ProductVariant } from '../types';
import { colorStock, uniqueColors, uniqueSizes, variantStock } from '../variants';

interface ProductVariantPickerProps {
  variants: ProductVariant[];
  color: string | null;
  size: string | null;
  onColorChange: (color: string) => void;
  onSizeChange: (size: string) => void;
}

export default function ProductVariantPicker({
  variants,
  color,
  size,
  onColorChange,
  onSizeChange,
}: ProductVariantPickerProps) {
  const { t } = useTranslation('shop');

  if (variants.length === 0) return null;

  const colors = uniqueColors(variants);
  const sizes = uniqueSizes(variants);
  const selectedStock = variantStock(variants, color, size);
  const hasStock = colors.some((option) => colorStock(variants, option) > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium tracking-widest text-primary">{t('detail.color')}</span>
        <div className="flex flex-wrap gap-2">
          {colors.map((option) => {
            const available = colorStock(variants, option) > 0;
            const selected = color === option;

            return (
              <button
                key={option}
                type="button"
                disabled={!available}
                aria-pressed={selected}
                onClick={() => onColorChange(option)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selected
                    ? 'border-primary bg-primary/10 text-secondary'
                    : 'border-border text-muted-foreground hover:border-primary/60'
                } ${available ? '' : 'cursor-not-allowed opacity-40'}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium tracking-widest text-primary">{t('detail.size')}</span>
        <div className="flex flex-wrap gap-2">
          {sizes.map((option) => {
            const stock = variantStock(variants, color, option);
            const available = stock > 0;
            const selected = size === option;

            return (
              <button
                key={option}
                type="button"
                disabled={!available}
                aria-pressed={selected}
                title={available ? undefined : t('detail.unavailable')}
                onClick={() => onSizeChange(option)}
                className={`min-w-10 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selected
                    ? 'border-primary bg-primary/10 text-secondary'
                    : 'border-border text-muted-foreground hover:border-primary/60'
                } ${available ? '' : 'cursor-not-allowed opacity-40 line-through'}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {!hasStock ? (
          <span className="text-xs font-medium text-destructive">{t('detail.outOfStock')}</span>
        ) : size ? (
          selectedStock > 0 ? (
            <span className="text-xs text-muted-foreground">
              {t('detail.stockLeft', { count: selectedStock })}
            </span>
          ) : (
            <span className="text-xs font-medium text-destructive">{t('detail.outOfStock')}</span>
          )
        ) : (
          <span className="text-xs text-muted-foreground">{t('detail.selectSizeHint')}</span>
        )}
      </div>
    </div>
  );
}
