"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { ProductFormPayload } from "@/types/admin";
import type { Category, Product } from "@/types/product";

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([
      adminService.getCategories().catch(() => []),
      adminService.getProductById(params.id),
    ])
      .then(([nextCategories, nextProduct]) => {
        setCategories(nextCategories);
        setProduct(nextProduct);
      })
      .catch((loadError) => setError(getApiErrorMessage(loadError)))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  async function handleSubmit(payload: ProductFormPayload) {
    setIsSubmitting(true);
    setError("");
    try {
      await adminService.updateProduct(params.id, payload);
      showToast("success", "Produit modifie avec succes.");
      router.push("/admin/products");
    } catch (submitError) {
      const message = getApiErrorMessage(submitError);
      setError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminLayout title="Modifier un produit">
      {isLoading ? (
        <Loader label="Chargement du produit" />
      ) : error && !product ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : product ? (
        <>
          {error ? (
            <Card className="mb-5 border-red-200 bg-red-50">
              <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
            </Card>
          ) : null}
          <ProductForm
            categories={categories}
            initialProduct={product}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </>
      ) : null}
    </AdminLayout>
  );
}
