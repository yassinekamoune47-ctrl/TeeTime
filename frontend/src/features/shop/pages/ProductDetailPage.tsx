import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useProducts } from '../hooks/useShop';
import OrderDialog from '../components/OrderDialog';

const money = (value: number) =>
  new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value);

export default function ProductDetailPage() {
  const { t } = useTranslation('shop');
  const { productId } = useParams<{ productId: string }>();
  const { data: products = [], isLoading, isError } = useProducts();
  const [ordering, setOrdering] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);

  useAuth();

  const product = products.find((item) => item.id === productId);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:px-25">
        <Link
          to="/shop"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          {t('detail.back')}
        </Link>

        {isLoading ? (
          <div className="h-[420px] animate-pulse rounded-xl bg-muted" />
        ) : isError || !product ? (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {isError ? t('page.error') : t('detail.notFound')}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div
              onMouseEnter={() => setImageHovered(true)}
              onMouseLeave={() => setImageHovered(false)}
              className="relative overflow-hidden rounded-xl border border-border bg-muted"
            >
              <img
                src={product.imageUrl || '/section1.png'}
                alt={product.name}
                className="aspect-square h-full w-full object-cover"
              />
              {product.hoverImageUrl && (
                <img
                  src={product.hoverImageUrl}
                  alt=""
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 aspect-square h-full w-full object-cover transition-opacity duration-500 ease-out ${
                    imageHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              )}
            </div>

            <div className="flex flex-col gap-4">
              <Badge className="w-fit border border-primary bg-primary/10 text-primary">
                {t(`categories.${product.category}`, { defaultValue: product.category })}
              </Badge>

              <h1 className="font-serif text-3xl font-bold text-secondary">{product.name}</h1>

              <span
                className={cn(
                  'text-2xl font-semibold',
                  product.price === null ? 'text-muted-foreground' : 'text-primary',
                )}
              >
                {product.price === null
                  ? t('page.priceOnRequest')
                  : t('page.price', { price: money(product.price) })}
              </span>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-widest text-primary">
                  {t('detail.description')}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description || '—'}
                </p>
              </div>

              <Button
                size="lg"
                className="mt-2 w-full gap-2 sm:w-fit"
                disabled={product.price === null}
                onClick={() => setOrdering(true)}
              >
                <ShoppingBag size={18} />
                {t('detail.order')}
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {product && ordering && (
        <OrderDialog
          key={product.id}
          product={product}
          onClose={() => setOrdering(false)}
        />
      )}
    </div>
  );
}
