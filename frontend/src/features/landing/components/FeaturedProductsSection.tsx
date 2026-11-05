import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useProducts } from '@/features/shop/hooks/useShop';
import ProductHoverImage from '@/features/shop/components/ProductHoverImage';
import SectionHeading from './SectionHeading';

const money = (value: number) =>
  new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value);

export default function FeaturedProductsSection() {
  const { t } = useTranslation(['landing', 'shop']);
  const { data: products = [], isLoading, isError } = useProducts();
  const featured = products.slice(0, 4);

  return (
    <section id="featured-products" className="bg-background py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-25">
        <SectionHeading
          eyebrow={t('sections.products.eyebrow')}
          title={t('sections.products.title')}
          subtitle={t('sections.products.subtitle')}
          action={
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-md border border-secondary/25 px-5 py-2.5 text-sm font-medium text-secondary transition-colors hover:border-primary hover:text-primary-hover"
            >
              {t('sections.products.viewAll')}
              <ArrowUpRight size={16} />
            </Link>
          }
        />

        {isLoading ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-[360px] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <p className="mt-10 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {t('shop:page.error')}
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <Link key={product.id} to={`/shop/${product.id}`} className="group block">
                <Card className="flex h-full flex-col overflow-hidden border-border/70 p-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-xl">
                  <ProductHoverImage product={product} className="aspect-[4/5] w-full" />
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-hover">
                      {t(`shop:categories.${product.category}`, { defaultValue: product.category })}
                    </span>
                    <h3 className="line-clamp-2 font-serif text-lg font-bold text-secondary">
                      {product.name}
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
                      <span
                        className={`font-semibold ${product.price === null ? 'text-muted-foreground' : 'text-secondary'}`}
                      >
                        {product.price === null
                          ? t('shop:page.priceOnRequest')
                          : `${money(product.price)} MAD`}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-hover transition-transform group-hover:translate-x-0.5">
                        {t('sections.products.view')}
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
