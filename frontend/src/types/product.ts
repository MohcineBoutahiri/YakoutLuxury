export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
};

export type ProductImage = {
  id: string;
  url: string;
  alt?: string | null;
  position: number;
  productId?: string;
};

export type ProductVariant = {
  id: string;
  productId?: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  oldPrice?: string | number | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  soldCount?: number | null;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
};

export type ProductFilters = {
  category?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ProductsResponse = {
  data: Product[];
  meta: PaginationMeta;
};
