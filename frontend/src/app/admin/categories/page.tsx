"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  AdminFilterActions,
  AdminFilterBar,
  AdminFilterSearch,
  AdminFilterSelect,
} from "@/components/admin/AdminFilterBar";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { CreateButton } from "@/components/admin/CreateButton";
import { FormModal } from "@/components/admin/FormModal";
import { IconActionButton } from "@/components/admin/IconActionButton";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { CategoryFormPayload } from "@/types/admin";
import type { Category } from "@/types/product";

export default function AdminCategoriesPage() {
  const categoryFormId = "admin-category-form";
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | undefined>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const { showToast } = useToast();

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      const isActive = category.isActive !== false;
      const matchesSearch =
        !query ||
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  function loadCategories() {
    setIsLoading(true);
    adminService
      .getCategories()
      .then(setCategories)
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(loadCategories, []);

  function startEdit(category: Category) {
    setEditing(category);
    setIsFormOpen(true);
  }

  function startCreate() {
    setEditing(undefined);
    setError("");
    setIsFormOpen(true);
  }

  async function handleSubmit(payload: CategoryFormPayload) {
    setError("");
    setIsSubmitting(true);
    try {
      if (editing) {
        const updatedCategory = await adminService.updateCategory(editing.id, payload);
        setCategories((current) =>
          current.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category,
          ),
        );
      } else {
        const createdCategory = await adminService.createCategory(payload);
        setCategories((current) => [createdCategory, ...current]);
      }
      showToast("success", editing ? "Categorie modifiee." : "Categorie creee.");
      setEditing(undefined);
      setIsFormOpen(false);
    } catch (submitError) {
      const message = getApiErrorMessage(submitError);
      setError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    try {
      await adminService.deleteCategory(deleteTarget.id);
      showToast("success", "Categorie supprimee.");
      setCategories((current) =>
        current.filter((category) => category.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (deleteError) {
      showToast("error", getApiErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  return (
    <AdminLayout title="Categories">
      <div className="space-y-5">
          <AdminFilterBar
            actions={
              <>
                <AdminFilterActions onReset={resetFilters} />
                <CreateButton label="Ajouter categorie" onClick={startCreate} />
              </>
            }
            className="xl:[grid-template-columns:minmax(210px,1fr)_minmax(135px,0.5fr)_auto]"
          >
            <AdminFilterSearch
              label="Recherche"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nom ou slug"
              value={search}
            />
            <AdminFilterSelect
              label="Statut"
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "active" | "inactive")
              }
              options={[
                ["all", "Toutes"],
                ["active", "Actives"],
                ["inactive", "Inactives"],
              ]}
              value={statusFilter}
            />
          </AdminFilterBar>

          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-luxury-text">{error}</CardContent>
            </Card>
          ) : categories.length === 0 ? (
            <EmptyState
              description="Ajoutez une categorie pour organiser la boutique."
              title="Aucune categorie"
            />
          ) : filteredCategories.length === 0 ? (
            <EmptyState
              description="Aucune categorie ne correspond aux filtres."
              title="Aucun resultat"
            />
          ) : (
            <>
              <p className="text-sm text-luxury-text">
                {filteredCategories.length} categorie(s) affichee(s)
              </p>
              <div className="hidden lg:block">
                <AdminTable headers={["Nom", "Slug", "Statut", "Actions"]}>
                  {filteredCategories.map((category) => (
                    <tr className="border-b border-luxury-beige" key={category.id}>
                      <td className="px-5 py-4 font-semibold">{category.name}</td>
                      <td className="px-5 py-4 text-luxury-text">{category.slug}</td>
                      <td className="px-5 py-4">
                        <AdminStatusBadge active={category.isActive !== false} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <IconActionButton
                            href={`/category/${category.slug}`}
                            icon={<Eye size={15} />}
                            label="Voir"
                            target="_blank"
                          />
                          <IconActionButton
                            icon={<Pencil size={15} />}
                            label="Modifier"
                            onClick={() => startEdit(category)}
                          />
                          <IconActionButton
                            icon={<Trash2 size={15} />}
                            label="Supprimer"
                            onClick={() => setDeleteTarget(category)}
                            variant="danger"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </AdminTable>
              </div>

              <div className="grid gap-4 lg:hidden">
                {filteredCategories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-heading text-2xl font-semibold">
                            {category.name}
                          </h3>
                          <p className="mt-1 text-sm text-luxury-text">{category.slug}</p>
                        </div>
                        <AdminStatusBadge active={category.isActive !== false} />
                      </div>
                      <div className="mt-4 flex justify-end gap-1.5">
                        <IconActionButton
                          href={`/category/${category.slug}`}
                          icon={<Eye size={15} />}
                          label="Voir"
                          target="_blank"
                        />
                        <IconActionButton
                          icon={<Pencil size={15} />}
                          label="Modifier"
                          onClick={() => startEdit(category)}
                        />
                        <IconActionButton
                          icon={<Trash2 size={15} />}
                          label="Supprimer"
                          onClick={() => setDeleteTarget(category)}
                          variant="danger"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
      </div>
      <FormModal
        description="Organisez les collections visibles dans la boutique."
        footer={
          <>
            <Button
              disabled={isSubmitting}
              onClick={() => {
                setIsFormOpen(false);
                setEditing(undefined);
              }}
              variant="soft"
            >
              Annuler
            </Button>
            <Button disabled={isSubmitting} form={categoryFormId} type="submit">
              {isSubmitting ? "Enregistrement..." : editing ? "Enregistrer" : "Creer"}
            </Button>
          </>
        }
        onClose={() => {
          setIsFormOpen(false);
          setEditing(undefined);
        }}
        open={isFormOpen}
        title={editing ? "Modifier la categorie" : "Ajouter une categorie"}
      >
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
        <CategoryForm
          formId={categoryFormId}
          hideActions
          initialCategory={editing}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </FormModal>
      <ConfirmModal
        confirmLabel="Supprimer"
        description={`La categorie "${deleteTarget?.name ?? ""}" sera supprimee definitivement.`}
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        open={Boolean(deleteTarget)}
        title="Supprimer cette categorie ?"
      />
    </AdminLayout>
  );
}
