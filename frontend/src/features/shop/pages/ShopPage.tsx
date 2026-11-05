import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Tag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useProducts } from '../hooks/useShop';
import { PRODUCT_CATEGORIES, type Product } from '../types';
import OrderDialog from '../components/OrderDialog';
import ProductHoverImage from '../components/ProductHoverImage';

const money = (value: number) =>
  new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value);

function ProductThumb({ product }: { product: Product }) {
  return (
    <Link to={`/shop/${product.id}`} className="block">
      <ProductHoverImage product={product} className="aspect-square w-full" />
    </Link>
  );
}

export default function ShopPage() {
  const { t } = useTranslation('shop');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const deferredSearch = useDeferredValue(search);

  // Hydrate the auth store so an existing session is recognised before ordering
  useAuth();

  const { data: products = [], isLoading, isError } = useProducts({
    category: category || undefined,
    search: deferredSearch.trim() || undefined,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 md:px-25">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="font-serif text-3xl font-bold text-secondary">{t('page.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('page.subtitle')}</p>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('page.searchPlaceholder')}
              className="border-primary pl-10 placeholder:text-secondary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={category === '' ? 'secondary' : 'outline'}
              onClick={() => setCategory('')}
              className="gap-1"
            >
              <Tag size={14} />
              {t('page.all')}
            </Button>
            {PRODUCT_CATEGORIES.map((key) => (
              <Button
                key={key}
                size="sm"
                variant={category === key ? 'secondary' : 'outline'}
                onClick={() => setCategory(key)}
              >
                {t(`categories.${key}`)}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-[330px] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {t('page.error')}
          </p>
        ) : products.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {t('page.empty')}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col overflow-hidden p-0">
                <ProductThumb product={product} />

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <span className="text-[11px] font-medium uppercase tracking-widest text-primary">
                    {t(`categories.${product.category}`, { defaultValue: product.category })}
                  </span>
                  <Link
                    to={`/shop/${product.id}`}
                    className="line-clamp-2 font-serif text-base font-bold text-secondary hover:text-primary"
                  >
                    {product.name}
                  </Link>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span
                      className={cn(
                        'font-semibold',
                        product.price === null ? 'text-muted-foreground' : 'text-secondary',
                      )}
                    >
                      {product.price === null
                        ? t('page.priceOnRequest')
                        : t('page.price', { price: money(product.price) })}
                    </span>
                    <Button
                      size="sm"
                      className="gap-1"
                      disabled={product.price === null}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <ShoppingBag size={14} />
                      {t('page.order')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {selectedProduct && (
        <OrderDialog
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
