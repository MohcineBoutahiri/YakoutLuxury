import type { Product, ProductVariant } from "@/types/product";

export type CartItem = {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: Product;
  variant?: ProductVariant | null;
};

export type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
};

export type AddToCartPayload = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type UpdateCartItemPayload = {
  quantity: number;
};

