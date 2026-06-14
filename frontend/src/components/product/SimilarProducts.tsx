"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";

type SimilarProductsProps = {
  product: Product;
};

export function SimilarProducts({ product }: SimilarProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    productService
      .getProducts({
        category: product.category?.slug ?? product.categoryId,
        limit: 6,
      })
      .then((response) => {
        if (isMounted) {
          setProducts(
            response.data
              .filter((item) => item.id !== product.id)
              .slice(0, 4),
          );
        }
      })
      .catch(() => {
        if (isMounted) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [product.category?.slug, product.categoryId, product.id]);

  if (!isLoaded) {
    return null;
  }

  return (
    <section className="mt-6 rounded-md border border-luxury-beige bg-white/95 p-4 shadow-luxury-soft sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="premium-eyebrow">Produits similaires</p>
          <h2 className="mt-1 font-heading text-2xl font-semibold">
            Completer la silhouette
          </h2>
        </div>
        <Link href="/shop">
          <Button className="h-10 px-4" variant="soft">
            Voir boutique
          </Button>
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 lg:grid-cols-4">
          {products.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          description="Aucune autre piece de cette collection n'est disponible pour le moment."
          title="Aucun produit similaire"
        />
      )}
    </section>
  );
}
