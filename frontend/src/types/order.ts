import type { Product, ProductVariant } from "@/types/product";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "CASH_ON_DELIVERY" | "CARD";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type OrderUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
};

export type OrderStatusHistory = {
  id: string;
  orderId: string;
  oldStatus?: OrderStatus | null;
  newStatus: OrderStatus;
  changedById?: string | null;
  changedBy?: (OrderUser & { role?: "CLIENT" | "ADMIN" }) | null;
  note?: string | null;
  source: "ADMIN_DASHBOARD" | "QR_SCAN" | "SYSTEM" | string;
  createdAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  name: string;
  sku?: string | null;
  price: string | number;
  quantity: number;
  product?: Product;
  variant?: ProductVariant | null;
};

export type Order = {
  id: string;
  userId: string;
  couponId?: string | null;
  orderNumber?: string;
  qrToken?: string;
  qrCodeUrl?: string | null;
  ticketPrintedAt?: string | null;
  lastStatusChangedAt?: string | null;
  lastStatusChangedById?: string | null;
  lastStatusChangedBy?: (OrderUser & { role?: "CLIENT" | "ADMIN" }) | null;
  totalAmount: string | number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  user?: OrderUser;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
};

export type CreateOrderPayload = {
  shippingAddress: string;
  phone: string;
  couponCode?: string;
};
