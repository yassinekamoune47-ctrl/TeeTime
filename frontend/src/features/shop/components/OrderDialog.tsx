import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/features/auth/store';
import { getApiErrorMessage } from '@/lib/apiError';
import { useCreateOrder } from '../hooks/useShop';
import type { Product } from '../types';
import { variantStock } from '../variants';
import ProductVariantPicker from './ProductVariantPicker';

interface OrderDialogProps {
  product: Product;
  onClose: () => void;
}

export default function OrderDialog({ product, onClose }: OrderDialogProps) {
  const { t } = useTranslation('shop');
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mutation = useCreateOrder();
  const variants = product.variants ?? [];
  const requiresVariant = variants.length > 0;
  const firstColor = variants.find((variant) => variant.stock > 0)?.color ?? variants[0]?.color ?? null;
  const [color, setColor] = useState<string | null>(firstColor);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const selectedStock = variantStock(variants, color, size);
  const maxQuantity = requiresVariant ? Math.min(10, Math.max(1, selectedStock)) : 10;
  const hasStock = variants.some((variant) => variant.stock > 0);
  const canSubmit =
    !mutation.isPending &&
    product.price !== null &&
    (!requiresVariant || (color !== null && size !== null && selectedStock > 0));

  const price = product.price ?? 0;
  const total = price * quantity;

  const money = (value: number) =>
    new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value);

  const handleColorChange = (nextColor: string) => {
    setColor(nextColor);

    if (size && variantStock(variants, nextColor, size) < 1) {
      setSize(null);
      setQuantity(1);
    }
  };

  const handleSizeChange = (nextSize: string) => {
    setSize(nextSize);
    const stock = variantStock(variants, color, nextSize);
    setQuantity((current) => Math.min(current, Math.min(10, Math.max(1, stock))));
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast.error(t('detail.loginRequired'));
      navigate('/login');
      return;
    }

    if (requiresVariant && (!color || !size)) {
      toast.error(t('detail.selectSize'));
      return;
    }

    mutation.mutate(
      {
        productId: product.id,
        quantity,
        notes: notes.trim() || undefined,
        size: requiresVariant ? size ?? undefined : undefined,
        color: requiresVariant ? color ?? undefined : undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('detail.success'), {
            description: t('detail.successDescription'),
          });
          onClose();
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, t('detail.error')));
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg text-secondary">
            {t('detail.order')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          <img
            src={product.imageUrl || '/section1.png'}
            alt={product.name}
            className="h-16 w-16 shrink-0 rounded-md object-cover"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold text-secondary">{product.name}</span>
            <span className="text-xs text-muted-foreground">
              {money(price)} MAD
            </span>
          </div>
        </div>

        {requiresVariant && (
          <ProductVariantPicker
            variants={variants}
            color={color}
            size={size}
            onColorChange={handleColorChange}
            onSizeChange={handleSizeChange}
          />
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium tracking-widest text-primary">
            {t('detail.quantity')}
          </label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="-"
            >
              <Minus size={14} />
            </Button>
            <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              disabled={quantity >= maxQuantity}
              aria-label="+"
            >
              <Plus size={14} />
            </Button>
            <span className="ml-auto text-sm text-muted-foreground">
              {t('detail.total')} : <span className="font-semibold text-secondary">{money(total)} MAD</span>
            </span>
          </div>
        </div>

        {requiresVariant && !hasStock && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            {t('detail.outOfStock')}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium tracking-widest text-primary">
            {t('detail.notes')}
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('detail.notesPlaceholder')}
            maxLength={500}
            className="border-border"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            {t('detail.close')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} className="gap-2">
            <ShoppingBag size={16} />
            {mutation.isPending ? t('detail.submitting') : t('detail.order')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
