import { api } from "@/services/api";
import type { Category } from "@/types/product";

function normalizeCategories(data: Category[] | { data: Category[] }) {
  return Array.isArray(data) ? data : data.data;
}

export const categoryService = {
  async getCategories() {
    const { data } = await api.get<Category[] | { data: Category[] }>("/categories");
    return normalizeCategories(data).filter((category) => category.isActive !== false);
  },

  async getCategoryBySlug(slug: string) {
    const { data } = await api.get<Category>(`/categories/${slug}`);
    return data;
  },
};

