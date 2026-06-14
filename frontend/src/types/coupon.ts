export type Coupon = {
  id: string;
  code: string;
  discountAmount?: string | number | null;
  discountRate?: string | number | null;
  minOrderAmount?: string | number | null;
  usageLimit?: number | null;
  usedCount: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CouponFormPayload = {
  code: string;
  discountAmount?: number;
  discountRate?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
};

export type ApplyCouponResponse = {
  coupon: Coupon;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
};
