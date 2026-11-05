import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  shopApi,
  type CreateOrderPayload,
  type PayOrderPayload,
  type VariantSubmission,
} from '@/api/endpoints/shop.api';
import type {
  Product,
  ProductOrder,
  ProductOrderFilters,
  ProductOrderStatus,
} from '../types';

export function useProducts(filters: ProductOrderFilters = {}) {
  return useQuery<Product[]>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const res = await shopApi.getProducts(filters);
      return res.data.data as Product[];
    },
    staleTime: 30_000,
    retry: false,
  });
}

export function useMyOrders() {
  return useQuery<ProductOrder[]>({
    queryKey: ['product-orders', 'mine'],
    queryFn: async () => {
      const res = await shopApi.getMyOrders();
      return res.data.data as ProductOrder[];
    },
    refetchInterval: 15_000,
    retry: false,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderPayload) => shopApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useManageProducts() {
  return useQuery<Product[]>({
    queryKey: ['products', 'manage'],
    queryFn: async () => {
      const res = await shopApi.getManageProducts();
      return res.data.data as Product[];
    },
    retry: false,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => shopApi.createProduct(formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      shopApi.updateProduct(id, formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shopApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProductVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, variants }: { id: string; variants: VariantSubmission[] }) =>
      shopApi.updateProductVariants(id, variants),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useProductOrders(status?: ProductOrderStatus) {
  return useQuery<ProductOrder[]>({
    queryKey: ['product-orders', status ?? 'ALL'],
    queryFn: async () => {
      const res = await shopApi.getOrders(status);
      return res.data.data as ProductOrder[];
    },
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
    retry: false,
  });
}

export function usePayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PayOrderPayload) => shopApi.payOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

export function useUpdateProductOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; status: 'ACCEPTED' | 'REJECTED' }) =>
      shopApi.updateOrderStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}
