import type { AuthUser } from "@/types/auth";
import type { Order, OrderStatus } from "@/types/order";
import type { Category, Product, ProductVariant } from "@/types/product";

export type DashboardStats = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: Array<
    ProductVariant & {
      product: Pick<Product, "id" | "name" | "slug" | "isActive" | "images">;
    }
  >;
  ordersByStatus: Array<{
    status: OrderStatus;
    count: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
};

export type ProductFormPayload = {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  categoryId: string;
  isFeatured: boolean;
  isActive: boolean;
  images: Array<{
    url: string;
    alt?: string;
    position?: number;
  }>;
  variants: Array<{
    size: string;
    color: string;
    stock: number;
    sku?: string;
  }>;
};

export type CategoryFormPayload = {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
};

export type AdminUsersResponse = {
  data: AuthUser[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminUsersQuery = {
  search?: string;
  role?: AuthUser["role"];
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type CreateAdminPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  password: string;
  confirmPassword: string;
};

export type ActivityLog = {
  id: string;
  adminId?: string | null;
  admin?: Pick<AuthUser, "id" | "firstName" | "lastName" | "email" | "role"> | null;
  action: string;
  entity: string;
  entityId?: string | null;
  description?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
};

export type ActivityLogsQuery = {
  adminId?: string;
  entity?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

export type ActivityLogsResponse = {
  data: ActivityLog[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminProductsResponse = {
  data: Product[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminCategoriesResponse = {
  data: Category[];
};
