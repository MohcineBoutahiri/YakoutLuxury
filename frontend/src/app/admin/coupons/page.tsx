"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { Coupon, CouponFormPayload } from "@/types/coupon";

const emptyForm = {
  code: "",
  discountType: "rate",
  discountValue: "",
  minOrderAmount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

type CouponFormState = typeof emptyForm;
type CouponFormErrors = Partial<Record<keyof CouponFormState | "dateRange", string>>;

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function formatCouponDiscount(coupon: Coupon) {
  if (coupon.discountRate !== null && coupon.discountRate !== undefined) {
    return `${Number(coupon.discountRate)}%`;
  }

  return <PriceDisplay price={coupon.discountAmount ?? 0} />;
}

function isExpired(coupon: Coupon) {
  return Boolean(coupon.expiresAt && new Date(coupon.expiresAt) < new Date());
}

export default function AdminCouponsPage() {
  const couponFormId = "admin-coupon-form";
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<CouponFormErrors>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "expired">(
    "all",
  );
  const { showToast } = useToast();

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const expired = isExpired(coupon);
      const matchesSearch = !query || coupon.code.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && coupon.isActive && !expired) ||
        (statusFilter === "inactive" && !coupon.isActive) ||
        (statusFilter === "expired" && expired);

      return matchesSearch && matchesStatus;
    });
  }, [coupons, search, statusFilter]);

  function loadCoupons() {
    setIsLoading(true);
    adminService
      .getCoupons()
      .then(setCoupons)
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(loadCoupons, []);

  function startEdit(coupon: Coupon) {
    setEditing(coupon);
    setIsFormOpen(true);
    setFormErrors({});
    setForm({
      code: coupon.code,
      discountType:
        coupon.discountRate !== null && coupon.discountRate !== undefined
          ? "rate"
          : "amount",
      discountValue: String(coupon.discountRate ?? coupon.discountAmount ?? ""),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : "",
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      startsAt: toDateInput(coupon.startsAt),
      expiresAt: toDateInput(coupon.expiresAt),
      isActive: coupon.isActive,
    });
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
  }

  function startCreate() {
    resetForm();
    setError("");
    setIsFormOpen(true);
  }

  function validateForm() {
    const nextErrors: CouponFormErrors = {};
    const discountValue = Number(form.discountValue);
    const minOrderAmount = form.minOrderAmount ? Number(form.minOrderAmount) : undefined;
    const usageLimit = form.usageLimit ? Number(form.usageLimit) : undefined;

    if (!form.code.trim()) {
      nextErrors.code = "Le code coupon est obligatoire.";
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      nextErrors.discountValue = "La reduction doit etre superieure a 0.";
    } else if (form.discountType === "rate" && discountValue > 100) {
      nextErrors.discountValue = "Le pourcentage ne peut pas depasser 100.";
    }

    if (
      minOrderAmount !== undefined &&
      (!Number.isFinite(minOrderAmount) || minOrderAmount < 0)
    ) {
      nextErrors.minOrderAmount = "Le montant minimum doit etre positif ou nul.";
    }

    if (
      usageLimit !== undefined &&
      (!Number.isInteger(usageLimit) || usageLimit <= 0)
    ) {
      nextErrors.usageLimit = "La limite doit etre un nombre entier superieur a 0.";
    }

    if (form.startsAt && form.expiresAt && new Date(form.expiresAt) < new Date(form.startsAt)) {
      nextErrors.dateRange = "La date d'expiration doit etre apres la date de debut.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildPayload(): CouponFormPayload {
    const discountValue = Number(form.discountValue);

    return {
      code: form.code.trim().toUpperCase(),
      isActive: form.isActive,
      ...(form.discountType === "rate"
        ? { discountRate: discountValue }
        : { discountAmount: discountValue }),
      ...(form.minOrderAmount ? { minOrderAmount: Number(form.minOrderAmount) } : {}),
      ...(form.usageLimit ? { usageLimit: Number(form.usageLimit) } : {}),
      ...(form.startsAt ? { startsAt: form.startsAt } : {}),
      ...(form.expiresAt ? { expiresAt: form.expiresAt } : {}),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editing) {
        await adminService.updateCoupon(editing.id, buildPayload());
      } else {
        await adminService.createCoupon(buildPayload());
      }
      showToast("success", editing ? "Coupon modifie." : "Coupon cree.");
      resetForm();
      setIsFormOpen(false);
      loadCoupons();
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
      await adminService.deleteCoupon(deleteTarget.id);
      showToast("success", "Coupon supprime.");
      setCoupons((current) =>
        current.filter((coupon) => coupon.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (deleteError) {
      showToast("error", getApiErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleStatus(coupon: Coupon) {
    setStatusUpdatingId(coupon.id);
    try {
      const updatedCoupon = await adminService.updateCouponStatus(
        coupon.id,
        !coupon.isActive,
      );
      setCoupons((current) =>
        current.map((item) => (item.id === updatedCoupon.id ? updatedCoupon : item)),
      );
      showToast("success", coupon.isActive ? "Coupon desactive." : "Coupon active.");
    } catch (statusError) {
      showToast("error", getApiErrorMessage(statusError));
    } finally {
      setStatusUpdatingId(null);
    }
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  return (
    <AdminLayout title="Coupons">
      <FormModal
        description="Configurez le code, les conditions et la visibilite du coupon."
        footer={
          <>
            <Button
              disabled={isSubmitting}
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
              }}
              variant="soft"
            >
              Annuler
            </Button>
            <Button disabled={isSubmitting} form={couponFormId} type="submit">
              {isSubmitting ? "Enregistrement..." : editing ? "Enregistrer" : "Creer"}
            </Button>
          </>
        }
        onClose={() => {
          setIsFormOpen(false);
          resetForm();
        }}
        open={isFormOpen}
        title={editing ? "Modifier le coupon" : "Nouveau coupon"}
      >
        <Card className="h-fit">
          <CardContent className="p-4 sm:p-6">
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              {editing ? "Modifier le coupon" : "Nouveau coupon"}
            </h2>
            <form className="mt-6 grid gap-4" id={couponFormId} onSubmit={handleSubmit}>
              <div className="rounded-md border border-luxury-beige bg-luxury-ivory/35 p-4">
                <h3 className="font-heading text-xl font-semibold sm:text-2xl">Code</h3>
                <p className="mt-1 text-sm text-luxury-text">
                  Configurez le code et le type de reduction.
                </p>
              </div>
              <Input
                error={formErrors.code}
                label="Code"
                onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
                required
                value={form.code}
              />
              <label className="block text-sm text-luxury-black">
                <span className="mb-2 block font-medium">Type de reduction</span>
                <select
                  className="h-12 w-full rounded-md border border-luxury-beige bg-white px-4 outline-none focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20"
                  onChange={(event) => setForm({ ...form, discountType: event.target.value })}
                  value={form.discountType}
                >
                  <option value="rate">Pourcentage</option>
                  <option value="amount">Montant fixe</option>
                </select>
              </label>
              <Input
                error={formErrors.discountValue}
                label={form.discountType === "rate" ? "Pourcentage" : "Montant fixe"}
                min="0.01"
                onChange={(event) => setForm({ ...form, discountValue: event.target.value })}
                required
                step="0.01"
                type="number"
                value={form.discountValue}
              />
              <div className="rounded-md border border-luxury-beige bg-luxury-ivory/35 p-4">
                <h3 className="font-heading text-xl font-semibold sm:text-2xl">Conditions</h3>
                <p className="mt-1 text-sm text-luxury-text">
                  Limitez l'utilisation selon le panier, les dates ou le nombre d'usages.
                </p>
              </div>
              <Input
                error={formErrors.minOrderAmount}
                label="Montant minimum"
                min="0"
                onChange={(event) => setForm({ ...form, minOrderAmount: event.target.value })}
                step="0.01"
                type="number"
                value={form.minOrderAmount}
              />
              <Input
                error={formErrors.usageLimit}
                label="Limite d'utilisation"
                min="1"
                onChange={(event) => setForm({ ...form, usageLimit: event.target.value })}
                type="number"
                value={form.usageLimit}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Debut"
                  onChange={(event) => setForm({ ...form, startsAt: event.target.value })}
                  type="date"
                  value={form.startsAt}
                />
                <Input
                  label="Expiration"
                  onChange={(event) => setForm({ ...form, expiresAt: event.target.value })}
                  type="date"
                  value={form.expiresAt}
                />
              </div>
              {formErrors.dateRange ? (
                <p className="text-sm text-red-600">{formErrors.dateRange}</p>
              ) : null}
              <label className="flex items-center gap-3 text-sm">
                <input
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                  type="checkbox"
                />
                Actif
              </label>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </form>
          </CardContent>
        </Card>
      </FormModal>

        <div className="space-y-5">
          <AdminFilterBar
            actions={
              <>
                <AdminFilterActions onReset={resetFilters} />
                <CreateButton label="Creer coupon" onClick={startCreate} />
              </>
            }
            className="xl:[grid-template-columns:minmax(210px,1fr)_minmax(140px,0.55fr)_auto]"
          >
            <AdminFilterSearch
              label="Recherche"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Code coupon"
              value={search}
            />
            <AdminFilterSelect
              label="Statut"
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "active" | "inactive" | "expired")
              }
              options={[
                ["all", "Tous"],
                ["active", "Actifs"],
                ["inactive", "Inactifs"],
                ["expired", "Expires"],
              ]}
              value={statusFilter}
            />
          </AdminFilterBar>

          {isLoading ? (
            <TableSkeleton />
          ) : coupons.length === 0 ? (
            <EmptyState
              description="Creez votre premier coupon pour l'utiliser au checkout."
              title="Aucun coupon"
            />
          ) : filteredCoupons.length === 0 ? (
            <EmptyState
              description="Aucun coupon ne correspond aux filtres."
              title="Aucun resultat"
            />
          ) : (
            <>
              <p className="text-sm text-luxury-text">
                {filteredCoupons.length} coupon(s) affiche(s)
              </p>
              <div className="hidden lg:block">
                <AdminTable
                  headers={["Code", "Reduction", "Usage", "Expiration", "Statut", "Actions"]}
                  minWidth="920px"
                >
                  {filteredCoupons.map((coupon) => (
                    <tr className="border-b border-luxury-beige" key={coupon.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{coupon.code}</span>
                          {isExpired(coupon) ? <StatusBadge status="EXPIRED" /> : null}
                        </div>
                      </td>
                      <td className="px-5 py-4">{formatCouponDiscount(coupon)}</td>
                      <td className="px-5 py-4">
                        {coupon.usedCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </td>
                      <td className="px-5 py-4">
                        {coupon.expiresAt
                          ? new Date(coupon.expiresAt).toLocaleDateString("fr-FR")
                          : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <AdminStatusBadge active={coupon.isActive} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <IconActionButton
                            icon={<Eye size={15} />}
                            label="Voir"
                            onClick={() => startEdit(coupon)}
                          />
                          <IconActionButton
                            icon={<Pencil size={15} />}
                            label="Modifier"
                            onClick={() => startEdit(coupon)}
                          />
                          <IconActionButton
                            disabled={statusUpdatingId === coupon.id}
                            icon={<Power size={15} />}
                            label={coupon.isActive ? "Desactiver" : "Activer"}
                            onClick={() => handleStatus(coupon)}
                            variant={coupon.isActive ? "danger" : "default"}
                          />
                          <IconActionButton
                            icon={<Trash2 size={15} />}
                            label="Supprimer"
                            onClick={() => setDeleteTarget(coupon)}
                            variant="danger"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </AdminTable>
              </div>

              <div className="grid gap-4 lg:hidden">
                {filteredCoupons.map((coupon) => (
                  <Card key={coupon.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-heading text-2xl font-semibold">{coupon.code}</h3>
                          <div className="mt-2">{formatCouponDiscount(coupon)}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <AdminStatusBadge active={coupon.isActive} />
                          {isExpired(coupon) ? <StatusBadge status="EXPIRED" /> : null}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-luxury-text">
                        Usage {coupon.usedCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""} - Expiration{" "}
                        {coupon.expiresAt
                          ? new Date(coupon.expiresAt).toLocaleDateString("fr-FR")
                          : "-"}
                      </p>
                      <div className="mt-4 flex justify-end gap-1.5">
                        <IconActionButton
                          icon={<Eye size={15} />}
                          label="Voir"
                          onClick={() => startEdit(coupon)}
                        />
                        <IconActionButton
                          icon={<Pencil size={15} />}
                          label="Modifier"
                          onClick={() => startEdit(coupon)}
                        />
                        <IconActionButton
                          disabled={statusUpdatingId === coupon.id}
                          icon={<Power size={15} />}
                          label={coupon.isActive ? "Desactiver" : "Activer"}
                          onClick={() => handleStatus(coupon)}
                          variant={coupon.isActive ? "danger" : "default"}
                        />
                        <IconActionButton
                          icon={<Trash2 size={15} />}
                          label="Supprimer"
                          onClick={() => setDeleteTarget(coupon)}
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
      <ConfirmModal
        confirmLabel="Supprimer"
        description={`Le coupon "${deleteTarget?.code ?? ""}" sera supprime definitivement.`}
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        open={Boolean(deleteTarget)}
        title="Supprimer ce coupon ?"
      />
    </AdminLayout>
  );
}
