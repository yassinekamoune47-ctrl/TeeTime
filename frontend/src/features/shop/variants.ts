import type { ProductVariant } from './types';

export function uniqueColors(variants: ProductVariant[]): string[] {
  return [...new Set(variants.map((variant) => variant.color))];
}

export function uniqueSizes(variants: ProductVariant[]): string[] {
  return [...new Set(variants.map((variant) => variant.size))];
}

export function colorStock(variants: ProductVariant[], color: string): number {
  return variants
    .filter((variant) => variant.color === color)
    .reduce((total, variant) => total + variant.stock, 0);
}

export function variantStock(variants: ProductVariant[], color: string | null, size: string | null): number {
  if (!color || !size) return 0;

  return (
    variants.find((variant) => variant.color === color && variant.size === size)?.stock ?? 0
  );
}
