"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductDetails } from "@/components/product/ProductDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { getApiErrorMessage } from "@/services/api";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setError("");

    productService
      .getProductBySlug(params.slug)
      .then(setProduct)
      .catch((loadError) => {
        setError(getApiErrorMessage(loadError));
        setProduct(null);
      })
      .finally(() => setIsLoading(false));
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-5">
        <Loader label="Chargement du produit" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <main className="px-5 py-12 sm:px-8 lg:px-12">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-8 text-center">
            <h1 className="font-heading text-4xl font-semibold">
              Produit introuvable
            </h1>
            <p className="mt-4 text-luxury-text">
              {error || "Cette piece n'est plus disponible."}
            </p>
            <Link className="mt-6 inline-block" href="/shop">
              <Button>Retour boutique</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <ProductDetails product={product} />;
}

