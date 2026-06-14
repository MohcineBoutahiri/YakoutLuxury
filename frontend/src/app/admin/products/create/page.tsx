"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { ProductFormPayload } from "@/types/admin";
import type { Category } from "@/types/product";

export default function AdminCreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    adminService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  async function handleSubmit(payload: ProductFormPayload) {
    setError("");
    setIsSubmitting(true);
    try {
      await adminService.createProduct(payload);
      showToast("success", "Produit cree avec succes.");
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
    <AdminLayout title="Creer un produit">
      {error ? (
        <Card className="mb-5 border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}
      <ProductForm
        categories={categories}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </AdminLayout>
  );
}
