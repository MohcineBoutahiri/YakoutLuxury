import { api } from "@/services/api";
import type { ApplyCouponResponse } from "@/types/coupon";

export const couponService = {
  async applyCoupon(code: string) {
    const { data } = await api.post<ApplyCouponResponse>("/coupons/apply", {
      code,
    });
    return data;
  },
};
