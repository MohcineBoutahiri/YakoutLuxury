"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Power } from "lucide-react";
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
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";
import { CreateButton } from "@/components/admin/CreateButton";
import { FormModal } from "@/components/admin/FormModal";
import { IconActionButton } from "@/components/admin/IconActionButton";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { AuthUser, Role } from "@/types/auth";

const pageSize = 20;

export default function AdminUsersPage() {
  const createAdminFormId = "admin-users-create-admin-form";
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<AuthUser | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("CLIENT");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const [verifiedFilter, setVerifiedFilter] = useState<
    "all" | "verified" | "unverified"
  >("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const loadUsers = useCallback(() => {
    setIsLoading(true);
    setError("");
    adminService
      .getUsers({
        search: search.trim() || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
        page,
        limit: pageSize,
      })
      .then((response) => {
        setUsers(response.data);
        setTotal(response.meta?.total ?? response.data.length);
        setTotalPages(response.meta?.totalPages ?? 1);
      })
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }, [page, roleFilter, search, showToast, statusFilter]);

  useEffect(() => {
    const timeout = window.setTimeout(loadUsers, 250);
    return () => window.clearTimeout(timeout);
  }, [loadUsers]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, search, statusFilter, verifiedFilter]);

  const visibleUsers = useMemo(() => {
    return users.filter((user) => {
      return (
        verifiedFilter === "all" ||
        (verifiedFilter === "verified" && user.isVerified) ||
        (verifiedFilter === "unverified" && !user.isVerified)
      );
    });
  }, [users, verifiedFilter]);

  async function confirmToggleStatus() {
    if (!statusTarget) {
      return;
    }

    const user = statusTarget;
    const nextStatus = !user.isActive;

    if (currentUser?.id === user.id && !nextStatus) {
      showToast("error", "Vous ne pouvez pas desactiver votre propre compte.");
      return;
    }

    setIsUpdatingId(user.id);
    try {
      const updatedUser = await adminService.updateUserStatus(user.id, nextStatus);
      setUsers((current) =>
        current.map((item) => (item.id === updatedUser.id ? updatedUser : item)),
      );
      showToast("success", nextStatus ? "Compte reactive." : "Compte desactive.");
      setStatusTarget(null);
    } catch (statusError) {
      showToast("error", getApiErrorMessage(statusError));
    } finally {
      setIsUpdatingId(null);
    }
  }

  function resetFilters() {
    setSearch("");
    setRoleFilter("CLIENT");
    setStatusFilter("all");
    setVerifiedFilter("all");
    setPage(1);
  }

  return (
    <AdminLayout title="Clients">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-luxury-text">
            Gestion des clients, admins et comptes actifs.
          </p>
        </div>
        <CreateButton
          label="Creer un admin"
          onClick={() => setIsCreateAdminOpen(true)}
        />
      </div>

      <AdminFilterBar
        actions={<AdminFilterActions onReset={resetFilters} />}
        className="xl:[grid-template-columns:minmax(240px,1.5fr)_minmax(140px,0.7fr)_minmax(140px,0.7fr)_minmax(155px,0.8fr)_auto]"
      >
        <AdminFilterSearch
          label="Recherche"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nom, email, telephone ou adresse"
          value={search}
        />
        <AdminFilterSelect
          label="Role"
          onValueChange={(value) => setRoleFilter(value as Role | "all")}
          options={[
            ["all", "Tous"],
            ["CLIENT", "Clients"],
            ["ADMIN", "Admins"],
          ]}
          value={roleFilter}
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
          label="Verification"
          onValueChange={(value) =>
            setVerifiedFilter(value as "all" | "verified" | "unverified")
          }
          options={[
            ["all", "Tous"],
            ["verified", "Verifies"],
            ["unverified", "Non verifies"],
          ]}
          value={verifiedFilter}
        />
      </AdminFilterBar>

      {isLoading ? (
        <Loader label="Chargement des clients" />
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-luxury-text">{error}</CardContent>
        </Card>
      ) : users.length === 0 ? (
        <EmptyState
          description="Aucun compte ne correspond aux filtres selectionnes."
          title="Aucun utilisateur"
        />
      ) : visibleUsers.length === 0 ? (
        <EmptyState
          description="Aucun utilisateur ne correspond a ce filtre de verification."
          title="Aucun resultat"
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-luxury-text">
            {visibleUsers.length} affiche(s) sur {total} compte(s)
          </p>
          <div className="hidden lg:block">
            <AdminTable
              headers={[
                "Nom complet",
                "Email",
                "Telephone",
                "Adresse",
                "Role",
                "Statut",
                "Verification",
                "Creation",
                "Actions",
              ]}
              minWidth="1220px"
            >
              {visibleUsers.map((user) => (
                <tr className="border-b border-luxury-beige" key={user.id}>
                  <td className="px-5 py-4 font-semibold">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-5 py-4 text-sm">{user.email}</td>
                  <td className="px-5 py-4 text-sm text-luxury-text">
                    {user.phone ?? "-"}
                  </td>
                  <td className="px-5 py-4 text-sm text-luxury-text">
                    {user.address ?? "-"}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={user.role === "ADMIN" ? "gold" : "light"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <AdminStatusBadge active={user.isActive} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={user.isVerified ? "VERIFIED" : "UNVERIFIED"} />
                  </td>
                  <td className="px-5 py-4 text-sm text-luxury-text">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                      <IconActionButton
                        href={`/admin/users/${user.id}`}
                        icon={<Eye size={15} />}
                        label="Voir"
                      />
                      <IconActionButton
                        disabled={isUpdatingId === user.id}
                        icon={<Power size={15} />}
                        label={user.isActive ? "Desactiver" : "Reactiver"}
                        onClick={() => setStatusTarget(user)}
                        variant={user.isActive ? "danger" : "default"}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>

          <div className="grid gap-4 lg:hidden">
            {visibleUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-2xl font-semibold">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="mt-1 text-sm text-luxury-text">{user.email}</p>
                      <p className="mt-1 text-sm text-luxury-text">{user.phone ?? "-"}</p>
                    </div>
                    <Badge variant={user.role === "ADMIN" ? "gold" : "light"}>
                      {user.role}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-luxury-text">
                    {user.address ?? "Adresse non renseignee"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <AdminStatusBadge active={user.isActive} />
                    <StatusBadge status={user.isVerified ? "VERIFIED" : "UNVERIFIED"} />
                    <Badge variant="muted">{formatDate(user.createdAt)}</Badge>
                  </div>
                  <div className="mt-4 flex justify-end gap-1.5">
                    <IconActionButton
                      href={`/admin/users/${user.id}`}
                      icon={<Eye size={15} />}
                      label="Voir"
                    />
                    <IconActionButton
                      disabled={isUpdatingId === user.id}
                      icon={<Power size={15} />}
                      label={user.isActive ? "Desactiver" : "Reactiver"}
                      onClick={() => setStatusTarget(user)}
                      variant={user.isActive ? "danger" : "default"}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination onPageChange={setPage} page={page} totalPages={totalPages} />
        </div>
      )}
      <ConfirmModal
        confirmLabel={statusTarget?.isActive ? "Desactiver" : "Reactiver"}
        description={`Confirmer le changement de statut du compte ${statusTarget?.email ?? ""} ?`}
        isLoading={Boolean(statusTarget && isUpdatingId === statusTarget.id)}
        onCancel={() => setStatusTarget(null)}
        onConfirm={confirmToggleStatus}
        open={Boolean(statusTarget)}
        title={statusTarget?.isActive ? "Desactiver ce compte ?" : "Reactiver ce compte ?"}
      />
      <FormModal
        description="Creez un compte administrateur sans quitter la liste des utilisateurs."
        footer={
          <>
            <Button disabled={isCreatingAdmin} onClick={() => setIsCreateAdminOpen(false)} variant="soft">
              Annuler
            </Button>
            <Button disabled={isCreatingAdmin} form={createAdminFormId} type="submit">
              {isCreatingAdmin ? "Creation..." : "Creer"}
            </Button>
          </>
        }
        onClose={() => setIsCreateAdminOpen(false)}
        open={isCreateAdminOpen}
        title="Creer un admin"
      >
        <CreateAdminForm
          formId={createAdminFormId}
          hideActions
          onCancel={() => setIsCreateAdminOpen(false)}
          onCreated={(admin) => {
            setIsCreateAdminOpen(false);
            setUsers((current) => [admin, ...current]);
            setTotal((current) => current + 1);
          }}
          onSubmittingChange={setIsCreatingAdmin}
        />
      </FormModal>
    </AdminLayout>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
