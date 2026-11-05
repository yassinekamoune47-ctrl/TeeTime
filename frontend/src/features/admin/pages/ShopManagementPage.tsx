import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Pencil, Plus, Ruler, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getApiErrorMessage } from '@/lib/apiError';
import {
  useCreateProduct,
  useDeleteProduct,
  useManageProducts,
  useProductOrders,
  useUpdateProduct,
  useUpdateProductOrderStatus,
} from '@/features/shop/hooks/useShop';
import type { Product, ProductCategory, ProductOrderStatus } from '@/features/shop/types';
import { PRODUCT_CATEGORIES } from '@/features/shop/types';
import ProductHoverImage from '@/features/shop/components/ProductHoverImage';
import ProductFormDialog from '../components/ProductFormDialog';
import ProductVariantsDialog from '../components/ProductVariantsDialog';

type Tab = 'products' | 'orders';
type StatusFilter = 'ALL' | ProductOrderStatus;

const orderStatusStyles: Record<ProductOrderStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-700',
  REJECTED: 'bg-red-500/10 text-red-700',
};

const money = (value: number) =>
  new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value);

export default function ShopManagementPage() {
  const { t, i18n } = useTranslation('shop');
  const [tab, setTab] = useState<Tab>('products');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const { data: products = [], isLoading, isError } = useManageProducts();
  const { data: orders = [], isLoading: ordersLoading } = useProductOrders();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateStatus = useUpdateProductOrderStatus();

  const pendingOrders = orders.filter((order) => order.status === 'PENDING');
  const visibleOrders =
    statusFilter === 'ALL' ? orders : orders.filter((order) => order.status === statusFilter);

  const isSaving = createProduct.isPending || updateProduct.isPending;

  const groupedProducts = useMemo(() => {
    const groups = new Map<string, Product[]>();
    for (const product of products) {
      const items = groups.get(product.category) ?? [];
      items.push(product);
      groups.set(product.category, items);
    }

    const knownCategories = PRODUCT_CATEGORIES.filter((category) => groups.has(category));
    const extraCategories = [...groups.keys()].filter(
      (category) => !PRODUCT_CATEGORIES.includes(category as ProductCategory),
    );

    return [...knownCategories, ...extraCategories].map((category) => ({
      category,
      products: groups.get(category) ?? [],
    }));
  }, [products]);

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSave = (formData: FormData) => {
    if (editing) {
      updateProduct.mutate(
        { id: editing.id, formData },
        {
          onSuccess: () => {
            toast.success(t('form.updated'));
            closeForm();
          },
          onError: (err) => toast.error(getApiErrorMessage(err, t('form.error'))),
        },
      );
      return;
    }

    createProduct.mutate(formData, {
      onSuccess: () => {
        toast.success(t('form.created'));
        closeForm();
      },
      onError: (err) => toast.error(getApiErrorMessage(err, t('form.error'))),
    });
  };

  const handleDelete = () => {
    if (!deleting) return;

    deleteProduct.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(t('manage.deleted'));
        setDeleting(null);
      },
      onError: (err) => toast.error(getApiErrorMessage(err, t('manage.deleteError'))),
    });
  };

  const handleOrderStatus = (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    setActiveOrderId(id);
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast.success(t(status === 'ACCEPTED' ? 'manage.accepted' : 'manage.rejected'));
        },
        onError: (err) => toast.error(getApiErrorMessage(err, t('manage.statusError'))),
        onSettled: () => setActiveOrderId(null),
      },
    );
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={tab === 'products' ? 'secondary' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => setTab('products')}
        >
          <ShoppingBag size={15} />
          {t('manage.tabs.products')}
          <span className="rounded-full bg-background/60 px-1.5 text-[11px]">{products.length}</span>
        </Button>
        <Button
          variant={tab === 'orders' ? 'secondary' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => setTab('orders')}
        >
          {t('manage.tabs.orders')}
          <span className="rounded-full bg-background/60 px-1.5 text-[11px]">{orders.length}</span>
        </Button>

        {tab === 'products' && (
          <Button
            className="ml-auto gap-2"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus size={16} />
            {t('manage.addProduct')}
          </Button>
        )}
      </div>

      {tab === 'products' ? (
        isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {t('manage.error')}
          </p>
        ) : products.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {t('manage.productsEmpty')}
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-muted-foreground">
              {t('manage.catalogSummary', {
                count: products.length,
                categories: groupedProducts.length,
              })}
            </p>

            <div className="flex flex-wrap gap-2">
              {groupedProducts.map(({ category, products: items }) => (
                <Button
                  key={category}
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() =>
                    document
                      .getElementById(`product-category-${category}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                >
                  {t(`categories.${category}`, { defaultValue: category })}
                  <span className="rounded-full bg-primary/10 px-1.5 text-[11px] font-medium text-primary">
                    {items.length}
                  </span>
                </Button>
              ))}
            </div>

            {groupedProducts.map(({ category, products: items }) => (
              <section
                key={category}
                id={`product-category-${category}`}
                className="flex scroll-mt-6 flex-col gap-3"
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
                  <Tag size={16} className="text-primary" />
                  <h2 className="font-serif text-lg font-bold text-secondary">
                    {t(`categories.${category}`, { defaultValue: category })}
                  </h2>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    {t('manage.categoryCount', { count: items.length })}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((product) => (
                    <Card key={product.id} className="flex flex-col overflow-hidden p-0">
                      <ProductHoverImage product={product} className="aspect-square w-full" />
                      <div className="flex flex-1 flex-col gap-1.5 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="line-clamp-2 text-sm font-semibold text-secondary">
                            {product.name}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              product.isActive
                                ? 'bg-emerald-500/10 text-emerald-700'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {product.isActive ? t('manage.active') : t('manage.inactive')}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-semibold ${product.price === null ? 'text-muted-foreground' : 'text-secondary'}`}
                        >
                          {product.price === null ? t('page.priceOnRequest') : `${money(product.price)} MAD`}
                        </span>

                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1 w-full gap-1"
                          onClick={() => setVariantProduct(product)}
                        >
                          <Ruler size={13} />
                          {t('manage.variantsButton', { count: product.variants?.length ?? 0 })}
                        </Button>

                        <div className="mt-auto flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1"
                            onClick={() => {
                              setEditing(product);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil size={13} />
                            {t('manage.edit')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => setDeleting(product)}
                          >
                            <Trash2 size={13} />
                            {t('manage.delete')}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t('manage.pendingCount', { count: pendingOrders.length })}
            </p>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as StatusFilter[]).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={statusFilter === status ? 'secondary' : 'outline'}
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'ALL' ? t('manage.filterAll') : t(`orders.status.${status}`)}
                </Button>
              ))}
            </div>
          </div>

          {ordersLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : visibleOrders.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              {t('manage.ordersEmpty')}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleOrders.map((order) => {
                const isBusy = updateStatus.isPending && activeOrderId === order.id;

                return (
                  <Card key={order.id} className="flex flex-wrap items-center gap-4 p-4">
                    <img
                      src={order.productImage || '/section1.png'}
                      alt={order.productName}
                      className="h-16 w-16 shrink-0 rounded-md object-cover"
                    />

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="font-serif text-sm font-bold text-secondary">{order.productName}</span>
                      <span className="text-xs text-muted-foreground">
                        {t('manage.orderNumber', { id: order.id })} · {order.playerName}
                        {order.playerEmail ? ` · ${order.playerEmail}` : ''}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t('manage.quantity')} : {order.quantity} × {money(order.unitPrice)} MAD · {formatDate(order.createdAt)}
                      </span>
                      {(order.size || order.color) && (
                        <span className="text-xs text-muted-foreground">
                          {order.size ? `${t('manage.size')} : ${order.size}` : ''}
                          {order.size && order.color ? ' · ' : ''}
                          {order.color ? `${t('manage.color')} : ${order.color}` : ''}
                        </span>
                      )}
                      {order.notes && (
                        <span className="text-xs italic text-muted-foreground">{order.notes}</span>
                      )}
                    </div>

                    <div className="ml-auto flex flex-col items-end gap-2">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {t('manage.total')}
                        </span>
                        <span className="font-semibold text-secondary">{money(order.amountDue)} MAD</span>
                      </div>

                      {order.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="gap-1"
                            disabled={isBusy}
                            onClick={() => handleOrderStatus(order.id, 'ACCEPTED')}
                          >
                            <Check size={14} />
                            {t('manage.accept')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            disabled={isBusy}
                            onClick={() => handleOrderStatus(order.id, 'REJECTED')}
                          >
                            <X size={14} />
                            {t('manage.reject')}
                          </Button>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${orderStatusStyles[order.status]}`}
                        >
                          {t(`orders.status.${order.status}`)}
                        </span>
                      )}

                      <span className="text-[11px] text-muted-foreground">
                        {order.paymentStatus === 'PAID' ? t('manage.paid') : t('manage.unpaid')}
                      </span>
                    </div>

                    {order.deliveryFullName && (
                      <div className="w-full basis-full border-t border-border pt-3">
                        <span className="text-[11px] font-medium uppercase tracking-widest text-primary">
                          {t('manage.deliveryTitle')}
                        </span>
                        <dl className="mt-1 grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                          <div className="flex gap-1">
                            <dt className="font-medium text-secondary">{t('manage.deliveryName')} :</dt>
                            <dd className="min-w-0 break-words">{order.deliveryFullName}</dd>
                          </div>
                          {order.deliveryPhone && (
                            <div className="flex gap-1">
                              <dt className="font-medium text-secondary">{t('manage.deliveryPhone')} :</dt>
                              <dd className="min-w-0 break-words">{order.deliveryPhone}</dd>
                            </div>
                          )}
                          {order.deliveryCity && (
                            <div className="flex gap-1">
                              <dt className="font-medium text-secondary">{t('manage.deliveryCity')} :</dt>
                              <dd className="min-w-0 break-words">{order.deliveryCity}</dd>
                            </div>
                          )}
                          {order.deliveryAddress && (
                            <div className="flex gap-1 sm:col-span-2">
                              <dt className="font-medium text-secondary">{t('manage.deliveryAddress')} :</dt>
                              <dd className="min-w-0 break-words">{order.deliveryAddress}</dd>
                            </div>
                          )}
                          {order.deliveryDetails && (
                            <div className="flex gap-1 sm:col-span-2">
                              <dt className="font-medium text-secondary">{t('manage.deliveryDetails')} :</dt>
                              <dd className="min-w-0 break-words">{order.deliveryDetails}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {formOpen && (
        <ProductFormDialog
          key={editing?.id ?? 'new'}
          initial={editing}
          isSaving={isSaving}
          onClose={closeForm}
          onSubmit={handleSave}
        />
      )}

      {variantProduct && (
        <ProductVariantsDialog
          key={variantProduct.id}
          product={variantProduct}
          onClose={() => setVariantProduct(null)}
        />
      )}

      {deleting && (
        <Dialog open onOpenChange={(open) => !open && setDeleting(null)}>
          <DialogContent className="bg-surface sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg text-secondary">{t('manage.deleteTitle')}</DialogTitle>
              <DialogDescription>
                {t('manage.deleteDescription', { name: deleting.name })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleting(null)}>
                {t('manage.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteProduct.isPending}
              >
                {t('manage.deleteConfirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
