export type ProductCategory =
  | 'CLUBS'
  | 'BALLS'
  | 'GLOVES'
  | 'TROUSERS'
  | 'APPAREL'
  | 'CAPS'
  | 'ACCESSORIES'
  | 'BAGS'
  | 'SHOES';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'CLUBS',
  'BALLS',
  'GLOVES',
  'TROUSERS',
  'APPAREL',
  'CAPS',
  'ACCESSORIES',
  'BAGS',
  'SHOES',
];

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number | null;
  priceOnRequest?: boolean;
  imageUrl: string;
  hoverImageUrl?: string;
  isActive: boolean;
  variants?: ProductVariant[];
  createdAt: string;
}

export type ProductOrderStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type PaymentStatus = 'UNPAID' | 'PAID';

export interface ProductOrder {
  id: string;
  status: ProductOrderStatus;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  amountDue: number;
  size: string | null;
  color: string | null;
  notes: string;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  deliveryFullName: string | null;
  deliveryPhone: string | null;
  deliveryCity: string | null;
  deliveryAddress: string | null;
  deliveryDetails: string | null;
  productId: string;
  productName: string;
  productImage: string;
  productCategory: string;
  playerName: string;
  playerEmail: string;
  createdAt: string;
}

export interface ProductOrderFilters {
  category?: string;
  search?: string;
}
