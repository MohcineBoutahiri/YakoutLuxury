import { api } from "@/services/api";
import type {
  AdminCategoriesResponse,
  ActivityLogsQuery,
  ActivityLogsResponse,
  AdminUsersQuery,
  AdminProductsResponse,
  AdminUsersResponse,
  CategoryFormPayload,
  CreateAdminPayload,
  DashboardStats,
  ProductFormPayload,
} from "@/types/admin";
import type { AuthUser } from "@/types/auth";
import type { Banner, BannerFormPayload } from "@/types/banner";
import type { Coupon, CouponFormPayload } from "@/types/coupon";
import type { Order, OrderStatus } from "@/types/order";
import type { Category, Product } from "@/types/product";
import type { Review, ReviewStatus } from "@/types/review";

function unwrapArray<T>(data: T[] | { data: T[] }) {
  return Array.isArray(data) ? data : data.data;
}

export const adminService = {
  async getDashboard() {
    const { data } = await api.get<DashboardStats>("/admin/dashboard");
    return data;
  },

  async getProducts() {
    const { data } = await api.get<AdminProductsResponse>("/admin/products", {
      params: { limit: 100 },
    });
    return data.data;
  },

  async getProductById(id: string) {
    const { data } = await api.get<Product>(`/admin/products/${id}`);
    return data;
  },

  async createProduct(payload: ProductFormPayload) {
    const { data } = await api.post<Product>("/admin/products", payload);
    return data;
  },

  async updateProduct(id: string, payload: ProductFormPayload) {
    const { data } = await api.put<Product>(`/admin/products/${id}`, payload);
    return data;
  },

  async deleteProduct(id: string) {
    await api.delete(`/admin/products/${id}`);
  },

  async updateProductStatus(id: string, isActive: boolean) {
    const { data } = await api.patch<Product>(`/admin/products/${id}/status`, {
      isActive,
    });
    return data;
  },

  async getCategories() {
    const { data } = await api.get<Category[] | AdminCategoriesResponse>(
      "/admin/categories",
    );
    return unwrapArray<Category>(data);
  },

  async createCategory(payload: CategoryFormPayload) {
    const { data } = await api.post<Category>("/admin/categories", payload);
    return data;
  },

  async updateCategory(id: string, payload: CategoryFormPayload) {
    const { data } = await api.put<Category>(`/admin/categories/${id}`, payload);
    return data;
  },

  async deleteCategory(id: string) {
    await api.delete(`/admin/categories/${id}`);
  },

  async getOrders(params?: {
    status?: OrderStatus;
    client?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const { data } = await api.get<{ data: Order[] } | Order[]>("/admin/orders", {
      params,
    });
    return unwrapArray<Order>(data);
  },

  async getOrderById(id: string) {
    const { data } = await api.get<Order>(`/admin/orders/${id}`);
    return data;
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string) {
    const { data } = await api.patch<Order>(`/admin/orders/${id}/status`, {
      note,
      status,
    });
    return data;
  },

  async getOrderTicket(id: string) {
    const { data } = await api.get<Order>(`/admin/orders/${id}/ticket`);
    return data;
  },

  async regenerateOrderQr(id: string) {
    const { data } = await api.post<Order>(`/admin/orders/${id}/regenerate-qr`);
    return data;
  },

  async getOrderByQrToken(qrToken: string) {
    const { data } = await api.get<Order>(`/admin/orders/scan/${qrToken}`);
    return data;
  },

  async updateScannedOrderStatus(
    qrToken: string,
    status: OrderStatus,
    note?: string,
  ) {
    const { data } = await api.patch<Order>(
      `/admin/orders/scan/${qrToken}/status`,
      {
        note,
        status,
      },
    );
    return data;
  },

  async getUsers(params?: AdminUsersQuery) {
    const { data } = await api.get<AdminUsersResponse>("/admin/users", {
      params,
    });
    return data;
  },

  async getUserById(id: string) {
    const { data } = await api.get<AuthUser>(`/admin/users/${id}`);
    return data;
  },

  async updateUserStatus(id: string, isActive: boolean) {
    const { data } = await api.patch<AuthUser>(`/admin/users/${id}/status`, {
      isActive,
    });
    return data;
  },

  async createAdmin(payload: CreateAdminPayload) {
    const { data } = await api.post<AuthUser>("/admin/users/create-admin", payload);
    return data;
  },

  async getActivityLogs(params?: ActivityLogsQuery) {
    const { data } = await api.get<ActivityLogsResponse>(
      "/admin/activity-logs",
      { params },
    );
    return data;
  },

  async getCoupons() {
    const { data } = await api.get<Coupon[]>("/admin/coupons");
    return data;
  },

  async createCoupon(payload: CouponFormPayload) {
    const { data } = await api.post<Coupon>("/admin/coupons", payload);
    return data;
  },

  async updateCoupon(id: string, payload: CouponFormPayload) {
    const { data } = await api.put<Coupon>(`/admin/coupons/${id}`, payload);
    return data;
  },

  async deleteCoupon(id: string) {
    await api.delete(`/admin/coupons/${id}`);
  },

  async updateCouponStatus(id: string, isActive: boolean) {
    const { data } = await api.patch<Coupon>(`/admin/coupons/${id}/status`, {
      isActive,
    });
    return data;
  },

  async getBanners() {
    const { data } = await api.get<Banner[]>("/admin/banners");
    return data;
  },

  async createBanner(payload: BannerFormPayload) {
    const { data } = await api.post<Banner>("/admin/banners", payload);
    return data;
  },

  async updateBanner(id: string, payload: BannerFormPayload) {
    const { data } = await api.put<Banner>(`/admin/banners/${id}`, payload);
    return data;
  },

  async deleteBanner(id: string) {
    await api.delete(`/admin/banners/${id}`);
  },

  async updateBannerStatus(id: string, isActive: boolean) {
    const { data } = await api.patch<Banner>(`/admin/banners/${id}/status`, {
      isActive,
    });
    return data;
  },

  async getReviews(params?: {
    search?: string;
    status?: ReviewStatus;
    page?: number;
    limit?: number;
  }) {
    const { data } = await api.get<{ data: Review[]; meta?: unknown }>(
      "/admin/reviews",
      { params },
    );
    return data;
  },

  async updateReviewStatus(id: string, status: ReviewStatus) {
    const { data } = await api.patch<Review>(`/admin/reviews/${id}/status`, {
      status,
    });
    return data;
  },

  async deleteReview(id: string) {
    await api.delete(`/admin/reviews/${id}`);
  },
};
