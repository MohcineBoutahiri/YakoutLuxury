import { api } from "@/services/api";
import type { Product, ProductFilters, ProductsResponse } from "@/types/product";

const defaultMeta = {
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
};

export const productService = {
  async getProducts(filters: ProductFilters = {}) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
    );

    const { data } = await api.get<ProductsResponse | Product[]>("/products", {
      params,
    });

    if (Array.isArray(data)) {
      return {
        data,
        meta: { ...defaultMeta, total: data.length, totalPages: 1 },
      };
    }

    return data;
  },

  async getFeaturedProducts() {
    const { data } = await api.get<Product[]>("/products/featured");
    return data;
  },

  async getProductBySlug(slug: string) {
    const { data } = await api.get<Product>(`/products/${slug}`);
    return data;
  },
};

