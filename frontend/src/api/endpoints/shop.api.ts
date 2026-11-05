import { api } from '@/api/apiConfig';
import type { ProductOrderFilters, ProductOrderStatus } from '@/features/shop/types';

export interface PayOrderPayload {
  id: string;
  deliveryFullName: string;
  deliveryPhone: string;
  deliveryCity: string;
  deliveryAddress: string;
  deliveryDetails: string | null;
}

export interface VariantSubmission {
  size: string;
  color: string;
  stock: number;
}

export interface CreateOrderPayload {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  notes?: string;
}

export const shopApi = {
  getProducts: (params?: ProductOrderFilters) => api.get('/products', { params }),
  getManageProducts: () => api.get('/products/manage'),
  createProduct: (formData: FormData) => api.post('/products', formData),
  updateProduct: (id: string, formData: FormData) => api.post(`/products/${id}`, formData),
  updateProductVariants: (id: string, variants: VariantSubmission[]) =>
    api.put(`/products/${id}/variants`, { variants }),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  getOrders: (status?: ProductOrderStatus) =>
    api.get('/product-orders', { params: { status: status || undefined } }),
  getMyOrders: () => api.get('/product-orders/mine'),
  createOrder: (data: CreateOrderPayload) => api.post('/product-orders', data),
  updateOrderStatus: (data: { id: string; status: 'ACCEPTED' | 'REJECTED' }) =>
    api.put('/product-orders/update-status', data),
  payOrder: (data: PayOrderPayload) => api.post('/product-orders/pay', data),
};
