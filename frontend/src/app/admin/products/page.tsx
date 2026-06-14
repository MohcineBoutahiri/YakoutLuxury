"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Power, Trash2 } from "lucide-react";
import {
  AdminFilterActions,
  AdminFilterBar,
  AdminFilterSearch,
  AdminFilterSelect,
} from "@/components/admin/AdminFilterBar";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { CreateButton } from "@/components/admin/CreateButton";
import { FormModal } from "@/components/admin/FormModal";
import { IconActionButton } from "@/components/admin/IconActionButton";
import { ProductForm } from "@/components/admin/ProductForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { ProductFormPayload } from "@/types/admin";
import type { Category, Product } from "@/types/product";

function getProductStock(product: Product) {
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
}

function ProductThumb({ product }: { product: Product }) {
  const image = product.images[0];

  if (image) {
    return (
      <img
        alt={image.alt ?? product.name}
        className="h-14 w-14 rounded-md object-cover"
        src={image.url}
      />
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-luxury-black font-heading text-sm text-luxury-gold">
      YL
    </div>
  );
}

function ProductMobileThumb({ product }: { product: Product }) {
  const image = product.images[0];

  if (image) {
    return (
      <img
        alt={image.alt ?? product.name}
        className="h-24 w-24 rounded-md object-cover"
        src={image.url}
      />
    );
  }

  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-md bg-luxury-black font-heading text-xl text-luxury-gold">
      YL
    </div>
  );
}

export default function AdminProductsPage() {
  const productFormId = "admin-product-create-form";
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "lowStock" | "outOfStock">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const { showToast } = useToast();

  const categoryOptions = useMemo(() => {
    const categories = new Map<string, string>();
    products.forEach((product) => {
      if (product.category?.id && product.category?.name) {
        categories.set(product.category.id, product.category.name);
      }
    });

    return [
      ["all", "Toutes"],
      ...Array.from(categories.entries()).sort((first, second) =>
        first[1].localeCompare(second[1]),
      ),
    ] as Array<[string, string]>;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const stock = getProductStock(product);
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        Boolean(product.category?.name?.toLowerCase().includes(query));
      const matchesCategory =
        categoryFilter === "all" || product.category?.id === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.isActive) ||
        (statusFilter === "inactive" && !product.isActive);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "inStock" && stock > 0) ||
        (stockFilter === "lowStock" && stock > 0 && stock <= 5) ||
        (stockFilter === "outOfStock" && stock === 0);

      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }, [categoryFilter, products, search, statusFilter, stockFilter]);

  function loadProducts() {
    setIsLoading(true);
    adminService
      .getProducts()
      .then(setProducts)
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(loadProducts, []);

  useEffect(() => {
    adminService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    try {
      await adminService.deleteProduct(deleteTarget.id);
      showToast("success", "Produit supprime.");
      setProducts((current) =>
        current.filter((product) => product.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (deleteError) {
      showToast("error", getApiErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleStatus(product: Product) {
    setStatusUpdatingId(product.id);
    try {
      const updatedProduct = await adminService.updateProductStatus(
        product.id,
        !product.isActive,
      );
      setProducts((current) =>
        current.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)),
      );
      showToast(
        "success",
        product.isActive ? "Produit desactive." : "Produit reactive.",
      );
    } catch (statusError) {
      showToast("error", getApiErrorMessage(statusError));
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleCreateProduct(payload: ProductFormPayload) {
    setCreateError("");
    setIsCreating(true);
    try {
      const createdProduct = await adminService.createProduct(payload);
      setProducts((current) => [createdProduct, ...current]);
      setIsCreateOpen(false);
      showToast("success", "Produit cree avec succes.");
    } catch (submitError) {
      const message = getApiErrorMessage(submitError);
      setCreateError(message);
      showToast("error", message);
    } finally {
      setIsCreating(false);
    }
  }

  function resetFilters() {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setStockFilter("all");
  }

  return (
    <AdminLayout title="Produits">
      <AdminFilterBar
        actions={
          <>
            <AdminFilterActions onReset={resetFilters} />
            <CreateButton label="Ajouter produit" onClick={() => setIsCreateOpen(true)} />
          </>
        }
        className="xl:[grid-template-columns:minmax(220px,1.4fr)_minmax(150px,0.9fr)_minmax(130px,0.75fr)_minmax(130px,0.75fr)_auto]"
      >
        <AdminFilterSearch
          label="Recherche"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nom, slug ou categorie"
          value={search}
        />
        <AdminFilterSelect
          label="Categorie"
          onValueChange={setCategoryFilter}
          options={categoryOptions}
          value={categoryFilter}
        />
        <AdminFilterSelect
          label="Statut"
          onValueChange={(value) =>
            setStatusFilter(value as "all" | "active" | "inactive")
          }
          options={[
            ["all", "Tous"],
            ["active", "Actifs"],
            ["inactive", "Inactifs"],
          ]}
          value={statusFilter}
        />
        <AdminFilterSelect
          label="Stock"
          onValueChange={(value) =>
            setStockFilter(value as "all" | "inStock" | "lowStock" | "outOfStock")
          }
          options={[
            ["all", "Tous"],
            ["inStock", "En stock"],
            ["lowStock", "Stock faible"],
            ["outOfStock", "Rupture"],
          ]}
          value={stockFilter}
        />
      </AdminFilterBar>

      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-luxury-text">{error}</CardContent>
        </Card>
      ) : products.length === 0 ? (
        <EmptyState
          description="Ajoutez votre premier produit pour alimenter la boutique."
          title="Aucun produit"
        />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          description="Aucun produit ne correspond a votre recherche."
          title="Aucun resultat"
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-luxury-text">
            {filteredProducts.length} produit(s) affiche(s)
          </p>
          <div className="hidden lg:block">
            <AdminTable
              headers={["Produit", "Categorie", "Prix", "Stock", "Statut", "Actions"]}
              minWidth="100%"
            >
              {filteredProducts.map((product) => (
                <tr className="border-b border-luxury-beige" key={product.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <ProductThumb product={product} />
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {product.isFeatured ? <StatusBadge status="FEATURED" /> : null}
                          <span className="text-xs text-luxury-text">{product.slug}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{product.category?.name ?? "-"}</td>
                  <td className="px-5 py-4">
                    <PriceDisplay price={product.price} />
                  </td>
                  <td className="px-5 py-4">{getProductStock(product)}</td>
                  <td className="px-5 py-4">
                    {!product.isActive ? (
                      <AdminStatusBadge active={false} />
                    ) : getProductStock(product) === 0 ? (
                      <StatusBadge status="OUT_OF_STOCK" />
                    ) : (
                      <AdminStatusBadge active={product.isActive} />
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <IconActionButton
                        href={`/product/${product.slug}`}
                        icon={<Eye size={15} />}
                        label="Voir"
                        target="_blank"
                      />
                      <IconActionButton
                        href={`/admin/products/edit/${product.id}`}
                        icon={<Pencil size={15} />}
                        label="Modifier"
                      />
                      <IconActionButton
                        disabled={statusUpdatingId === product.id}
                        icon={<Power size={15} />}
                        label={product.isActive ? "Desactiver" : "Reactiver"}
                        onClick={() => handleStatus(product)}
                        variant={product.isActive ? "danger" : "default"}
                      />
                      <IconActionButton
                        icon={<Trash2 size={15} />}
                        label="Supprimer"
                        onClick={() => setDeleteTarget(product)}
                        variant="danger"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>

          <div className="grid gap-4 lg:hidden">
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <ProductMobileThumb product={product} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-xl font-semibold">{product.name}</h3>
                        {!product.isActive ? (
                          <AdminStatusBadge active={false} />
                        ) : getProductStock(product) === 0 ? (
                          <StatusBadge status="OUT_OF_STOCK" />
                        ) : (
                          <AdminStatusBadge active={product.isActive} />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-luxury-text">
                        {product.category?.name ?? "Sans categorie"} - Stock{" "}
                        {getProductStock(product)}
                      </p>
                      <div className="mt-2">
                        <PriceDisplay price={product.price} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <div className="flex justify-end gap-1.5">
                      <IconActionButton
                        href={`/product/${product.slug}`}
                        icon={<Eye size={15} />}
                        label="Voir"
                        target="_blank"
                      />
                      <IconActionButton
                        href={`/admin/products/edit/${product.id}`}
                        icon={<Pencil size={15} />}
                        label="Modifier"
                      />
                      <IconActionButton
                        disabled={statusUpdatingId === product.id}
                        icon={<Power size={15} />}
                        label={product.isActive ? "Desactiver" : "Reactiver"}
                        onClick={() => handleStatus(product)}
                        variant={product.isActive ? "danger" : "default"}
                      />
                      <IconActionButton
                        icon={<Trash2 size={15} />}
                        label="Supprimer"
                        onClick={() => setDeleteTarget(product)}
                        variant="danger"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <ConfirmModal
        confirmLabel="Supprimer"
        description={`Le produit "${deleteTarget?.name ?? ""}" sera supprime definitivement.`}
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        open={Boolean(deleteTarget)}
        title="Supprimer ce produit ?"
      />
      <FormModal
        description="Ajoutez un nouveau produit, ses images, variantes et stock sans quitter la table."
        footer={
          <>
            <Button disabled={isCreating} onClick={() => setIsCreateOpen(false)} variant="soft">
              Annuler
            </Button>
            <Button disabled={isCreating} form={productFormId} type="submit">
              {isCreating ? "Creation..." : "Creer le produit"}
            </Button>
          </>
        }
        onClose={() => setIsCreateOpen(false)}
        open={isCreateOpen}
        size="fullscreen"
        title="Ajouter un produit"
      >
        {createError ? (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">{createError}</CardContent>
          </Card>
        ) : null}
        <ProductForm
          categories={categories}
          formId={productFormId}
          hideActions
          isSubmitting={isCreating}
          onSubmit={handleCreateProduct}
        />
      </FormModal>
    </AdminLayout>
  );
}
