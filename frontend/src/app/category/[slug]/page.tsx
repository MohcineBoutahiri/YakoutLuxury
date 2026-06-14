"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { uniqueNormalizedColors, uniqueNormalizedSizes } from "@/lib/variants";
import { getApiErrorMessage } from "@/services/api";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import type {
  Category,
  PaginationMeta,
  Product,
  ProductFilters as ProductFiltersType,
} from "@/types/product";

const initialMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 9,
  totalPages: 0,
};

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ProductFiltersType>({
    category: slug,
    page: 1,
    limit: 9,
  });
  const [meta, setMeta] = useState(initialMeta);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setFilters((current) => ({ ...current, category: slug, page: 1 }));
    categoryService
      .getCategoryBySlug(slug)
      .then(setCategory)
      .catch(() => setCategory(null));
  }, [slug]);

  useEffect(() => {
    setIsLoading(true);
    setError("");

    productService
      .getProducts(filters)
      .then((response) => {
        setProducts(response.data);
        setMeta(response.meta);
        setCategory((current) => current ?? response.data[0]?.category ?? null);
      })
      .catch((loadError) => {
        setError(getApiErrorMessage(loadError));
        setProducts([]);
        setMeta(initialMeta);
      })
      .finally(() => setIsLoading(false));
  }, [filters]);

  const sizes = useMemo(
    () =>
      uniqueNormalizedSizes(
        products.flatMap((product) => product.variants.map((variant) => variant.size)),
      ),
    [products],
  );
  const colors = useMemo(
    () =>
      uniqueNormalizedColors(
        products.flatMap((product) => product.variants.map((variant) => variant.color)),
      ),
    [products],
  );

  return (
    <main className="px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 border-b border-luxury-beige pb-8">
          <p className="text-sm uppercase text-luxury-gold">Categorie</p>
          <h1 className="mt-3 break-words font-heading text-4xl font-semibold sm:text-5xl">
            {category?.name ?? slug}
          </h1>
          <p className="mt-4 max-w-2xl leading-8 text-luxury-text">
            {category?.description ??
              "Selection active de la maison Yakout Luxury."}
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          <aside className="min-w-0">
            <Card className="lg:sticky lg:top-24">
              <CardContent className="p-5">
                <ProductFilters
                  categories={category ? [category] : []}
                  colors={colors}
                  filters={filters}
                  onChange={(nextFilters) =>
                    setFilters({ ...nextFilters, category: slug })
                  }
                  onReset={() => setFilters({ category: slug, page: 1, limit: 9 })}
                  sizes={sizes}
                />
                <Link className="mt-5 block text-sm text-luxury-text" href="/shop">
                  Voir toute la boutique
                </Link>
              </CardContent>
            </Card>
          </aside>

          <section className="min-w-0">
            {isLoading ? (
              <div className="flex min-h-80 items-center justify-center">
                <Loader label="Chargement de la categorie" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6 text-luxury-text">{error}</CardContent>
              </Card>
            ) : (
              <ProductGrid products={products} />
            )}

            <div className="mt-8 grid gap-3 sm:flex sm:items-center sm:justify-center">
              <Button
                className="w-full sm:w-auto"
                disabled={meta.page <= 1 || isLoading}
                onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) - 1 }))}
                variant="ghost"
              >
                Precedent
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={meta.page >= meta.totalPages || isLoading}
                onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
                variant="dark"
              >
                Suivant
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
