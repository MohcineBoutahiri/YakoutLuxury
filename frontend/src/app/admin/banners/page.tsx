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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { Banner, BannerFormPayload } from "@/types/banner";

const emptyForm = {
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "",
  position: "0",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

type BannerFormState = typeof emptyForm;
type BannerFormErrors = Partial<Record<keyof BannerFormState | "dateRange", string>>;

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function isFinished(banner: Banner) {
  return Boolean(banner.endsAt && new Date(banner.endsAt) < new Date());
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function AdminBannersPage() {
  const bannerFormId = "admin-banner-form";
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<BannerFormErrors>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "finished">(
    "all",
  );
  const { showToast } = useToast();

  const filteredBanners = useMemo(() => {
    const query = search.trim().toLowerCase();

    return banners.filter((banner) => {
      const finished = isFinished(banner);
      const matchesSearch =
        !query ||
        banner.title.toLowerCase().includes(query) ||
        Boolean(banner.subtitle?.toLowerCase().includes(query)) ||
        Boolean(banner.linkUrl?.toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && banner.isActive && !finished) ||
        (statusFilter === "inactive" && !banner.isActive) ||
        (statusFilter === "finished" && finished);

      return matchesSearch && matchesStatus;
    });
  }, [banners, search, statusFilter]);

  function loadBanners() {
    setIsLoading(true);
    adminService
      .getBanners()
      .then(setBanners)
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(loadBanners, []);

  function startEdit(banner: Banner) {
    setEditing(banner);
    setIsFormOpen(true);
    setFormErrors({});
    setForm({
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl ?? "",
      position: String(banner.position),
      startsAt: toDateInput(banner.startsAt),
      endsAt: toDateInput(banner.endsAt),
      isActive: banner.isActive,
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
    const nextErrors: BannerFormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Le titre est obligatoire.";
    }

    if (!form.imageUrl.trim()) {
      nextErrors.imageUrl = "L'image est obligatoire.";
    } else if (!isValidHttpUrl(form.imageUrl)) {
      nextErrors.imageUrl = "L'image doit etre une URL http(s) valide.";
    }

    if (Number(form.position) < 0) {
      nextErrors.position = "La position doit etre positive ou nulle.";
    }

    if (form.startsAt && form.endsAt && new Date(form.endsAt) < new Date(form.startsAt)) {
      nextErrors.dateRange = "La date de fin doit etre apres la date de debut.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildPayload(): BannerFormPayload {
    return {
      title: form.title.trim(),
      imageUrl: form.imageUrl.trim(),
      isActive: form.isActive,
      position: Number(form.position) || 0,
      ...(form.subtitle.trim() ? { subtitle: form.subtitle.trim() } : {}),
      ...(form.linkUrl.trim() ? { linkUrl: form.linkUrl.trim() } : {}),
      ...(form.startsAt ? { startsAt: form.startsAt } : {}),
      ...(form.endsAt ? { endsAt: form.endsAt } : {}),
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
        await adminService.updateBanner(editing.id, buildPayload());
      } else {
        await adminService.createBanner(buildPayload());
      }
      showToast("success", editing ? "Banniere modifiee." : "Banniere creee.");
      resetForm();
      setIsFormOpen(false);
      loadBanners();
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
      await adminService.deleteBanner(deleteTarget.id);
      showToast("success", "Banniere supprimee.");
      setBanners((current) =>
        current.filter((banner) => banner.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (deleteError) {
      showToast("error", getApiErrorMessage(deleteError));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleStatus(banner: Banner) {
    setStatusUpdatingId(banner.id);
    try {
      const updatedBanner = await adminService.updateBannerStatus(
        banner.id,
        !banner.isActive,
      );
      setBanners((current) =>
        current.map((item) => (item.id === updatedBanner.id ? updatedBanner : item)),
      );
      showToast("success", banner.isActive ? "Banniere desactivee." : "Banniere activee.");
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
    <AdminLayout title="Bannieres">
      <FormModal
        description="Preparez les visuels affiches sur la page d'accueil."
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
            <Button disabled={isSubmitting} form={bannerFormId} type="submit">
              {isSubmitting ? "Enregistrement..." : editing ? "Enregistrer" : "Creer"}
            </Button>
          </>
        }
        onClose={() => {
          setIsFormOpen(false);
          resetForm();
        }}
        open={isFormOpen}
        title={editing ? "Modifier la banniere" : "Nouvelle banniere"}
      >
        <Card className="h-fit">
          <CardContent className="p-4 sm:p-6">
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              {editing ? "Modifier la banniere" : "Nouvelle banniere"}
            </h2>
            <form className="mt-6 grid gap-4" id={bannerFormId} onSubmit={handleSubmit}>
              <div className="rounded-md border border-luxury-beige bg-luxury-ivory/35 p-4">
                <h3 className="font-heading text-xl font-semibold sm:text-2xl">Contenu</h3>
                <p className="mt-1 text-sm text-luxury-text">
                  Texte et visuel affiches sur la page d'accueil.
                </p>
              </div>
              <Input
                error={formErrors.title}
                label="Titre"
                maxLength={120}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
                value={form.title}
              />
              <Input
                label="Sous-titre"
                maxLength={220}
                onChange={(event) => setForm({ ...form, subtitle: event.target.value })}
                value={form.subtitle}
              />
              <Input
                error={formErrors.imageUrl}
                label="Image"
                onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                placeholder="https://..."
                required
                type="url"
                value={form.imageUrl}
              />
              <div className="overflow-hidden rounded-md border border-luxury-beige bg-luxury-black">
                <div className="flex h-40 items-center justify-center text-sm text-luxury-gold">
                  {isValidHttpUrl(form.imageUrl) ? (
                    <img
                      alt={form.title || "Banniere"}
                      className="h-full w-full object-cover"
                      src={form.imageUrl}
                    />
                  ) : (
                    "Apercu image"
                  )}
                </div>
              </div>
              <Input
                label="Lien"
                onChange={(event) => setForm({ ...form, linkUrl: event.target.value })}
                placeholder="/shop"
                value={form.linkUrl}
              />
              <div className="rounded-md border border-luxury-beige bg-luxury-ivory/35 p-4">
                <h3 className="font-heading text-xl font-semibold sm:text-2xl">Publication</h3>
                <p className="mt-1 text-sm text-luxury-text">
                  Ordre d'affichage et periode de visibilite.
                </p>
              </div>
              <Input
                error={formErrors.position}
                label="Position"
                min="0"
                onChange={(event) => setForm({ ...form, position: event.target.value })}
                type="number"
                value={form.position}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Debut"
                  onChange={(event) => setForm({ ...form, startsAt: event.target.value })}
                  type="date"
                  value={form.startsAt}
                />
                <Input
                  label="Fin"
                  onChange={(event) => setForm({ ...form, endsAt: event.target.value })}
                  type="date"
                  value={form.endsAt}
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
                Active
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
                <CreateButton label="Creer banniere" onClick={startCreate} />
              </>
            }
            className="xl:[grid-template-columns:minmax(210px,1fr)_minmax(145px,0.55fr)_auto]"
          >
            <AdminFilterSearch
              label="Recherche"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Titre, sous-titre ou lien"
              value={search}
            />
            <AdminFilterSelect
              label="Statut"
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "active" | "inactive" | "finished")
              }
              options={[
                ["all", "Toutes"],
                ["active", "Actives"],
                ["inactive", "Inactives"],
                ["finished", "Terminees"],
              ]}
              value={statusFilter}
            />
          </AdminFilterBar>

          {isLoading ? (
            <TableSkeleton />
          ) : banners.length === 0 ? (
            <EmptyState
              description="Les bannieres actives seront affichees sur la page d'accueil."
              title="Aucune banniere"
            />
          ) : filteredBanners.length === 0 ? (
            <EmptyState
              description="Aucune banniere ne correspond aux filtres."
              title="Aucun resultat"
            />
          ) : (
            <>
              <p className="text-sm text-luxury-text">
                {filteredBanners.length} banniere(s) affichee(s)
              </p>
              <div className="hidden lg:block">
                <AdminTable
                  headers={["Banniere", "Position", "Periode", "Statut", "Actions"]}
                  minWidth="980px"
                >
                  {filteredBanners.map((banner) => (
                    <tr className="border-b border-luxury-beige" key={banner.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            alt={banner.title}
                            className="h-16 w-24 rounded-md object-cover"
                            src={banner.imageUrl}
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{banner.title}</p>
                              {isFinished(banner) ? (
                                <StatusBadge label="Terminee" status="EXPIRED" />
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm text-luxury-text">{banner.linkUrl ?? "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">{banner.position}</td>
                      <td className="px-5 py-4 text-sm text-luxury-text">
                        {banner.startsAt
                          ? new Date(banner.startsAt).toLocaleDateString("fr-FR")
                          : "-"}
                        {" / "}
                        {banner.endsAt
                          ? new Date(banner.endsAt).toLocaleDateString("fr-FR")
                          : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <AdminStatusBadge active={banner.isActive} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <IconActionButton
                            disabled={!banner.linkUrl}
                            href={banner.linkUrl ?? undefined}
                            icon={<Eye size={15} />}
                            label="Voir"
                            target="_blank"
                          />
                          <IconActionButton
                            icon={<Pencil size={15} />}
                            label="Modifier"
                            onClick={() => startEdit(banner)}
                          />
                          <IconActionButton
                            disabled={statusUpdatingId === banner.id}
                            icon={<Power size={15} />}
                            label={banner.isActive ? "Desactiver" : "Activer"}
                            onClick={() => handleStatus(banner)}
                            variant={banner.isActive ? "danger" : "default"}
                          />
                          <IconActionButton
                            icon={<Trash2 size={15} />}
                            label="Supprimer"
                            onClick={() => setDeleteTarget(banner)}
                            variant="danger"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </AdminTable>
              </div>

              <div className="grid gap-4 lg:hidden">
                {filteredBanners.map((banner) => (
                  <Card key={banner.id}>
                    <CardContent className="p-4">
                      <img
                        alt={banner.title}
                        className="h-36 w-full rounded-md object-cover"
                        src={banner.imageUrl}
                      />
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-heading text-2xl font-semibold">{banner.title}</h3>
                          <p className="mt-1 text-sm text-luxury-text">
                            Position {banner.position} - {banner.linkUrl ?? "Sans lien"}
                          </p>
                        </div>
                        <AdminStatusBadge active={banner.isActive} />
                      </div>
                      {isFinished(banner) ? (
                        <div className="mt-3">
                          <StatusBadge label="Terminee" status="EXPIRED" />
                        </div>
                      ) : null}
                      <div className="mt-4 flex justify-end gap-1.5">
                        <IconActionButton
                          disabled={!banner.linkUrl}
                          href={banner.linkUrl ?? undefined}
                          icon={<Eye size={15} />}
                          label="Voir"
                          target="_blank"
                        />
                        <IconActionButton
                          icon={<Pencil size={15} />}
                          label="Modifier"
                          onClick={() => startEdit(banner)}
                        />
                        <IconActionButton
                          disabled={statusUpdatingId === banner.id}
                          icon={<Power size={15} />}
                          label={banner.isActive ? "Desactiver" : "Activer"}
                          onClick={() => handleStatus(banner)}
                          variant={banner.isActive ? "danger" : "default"}
                        />
                        <IconActionButton
                          icon={<Trash2 size={15} />}
                          label="Supprimer"
                          onClick={() => setDeleteTarget(banner)}
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
        description={`La banniere "${deleteTarget?.title ?? ""}" sera supprimee definitivement.`}
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        open={Boolean(deleteTarget)}
        title="Supprimer cette banniere ?"
      />
    </AdminLayout>
  );
}
