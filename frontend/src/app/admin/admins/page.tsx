"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";
import { CreateButton } from "@/components/admin/CreateButton";
import { FormModal } from "@/components/admin/FormModal";
import { IconActionButton } from "@/components/admin/IconActionButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { AuthUser } from "@/types/auth";

export default function AdminsPage() {
  const createAdminFormId = "admins-create-admin-form";
  const [admins, setAdmins] = useState<AuthUser[]>([]);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    adminService
      .getUsers({ role: "ADMIN", limit: 100 })
      .then((response) => setAdmins(response.data))
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }, [showToast]);

  return (
    <AdminLayout title="Administrateurs">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-luxury-text">
          Comptes ayant acces au dashboard et aux operations sensibles.
        </p>
        <CreateButton label="Creer un admin" onClick={() => setIsCreateOpen(true)} />
      </div>

      {isLoading ? (
        <Loader label="Chargement des administrateurs" />
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-luxury-text">{error}</CardContent>
        </Card>
      ) : admins.length === 0 ? (
        <EmptyState
          description="Aucun compte administrateur n'est disponible."
          title="Aucun administrateur"
        />
      ) : (
        <div className="space-y-4">
          <div className="hidden lg:block">
            <AdminTable
              headers={["Nom", "Email", "Telephone", "Statut", "Verification", "Creation", "Actions"]}
              minWidth="980px"
            >
              {admins.map((admin) => (
                <tr className="border-b border-luxury-beige" key={admin.id}>
                  <td className="px-5 py-4 font-semibold">
                    {admin.firstName} {admin.lastName}
                  </td>
                  <td className="px-5 py-4 text-sm">{admin.email}</td>
                  <td className="px-5 py-4 text-sm text-luxury-text">
                    {admin.phone ?? "-"}
                  </td>
                  <td className="px-5 py-4">
                    <AdminStatusBadge active={admin.isActive} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={admin.isVerified ? "VERIFIED" : "UNVERIFIED"} />
                  </td>
                  <td className="px-5 py-4 text-sm text-luxury-text">
                    {formatDate(admin.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end">
                      <IconActionButton
                        href={`/admin/users/${admin.id}`}
                        icon={<Eye size={15} />}
                        label="Voir"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </AdminTable>
          </div>

          <div className="grid gap-4 lg:hidden">
            {admins.map((admin) => (
              <Card key={admin.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-2xl font-semibold">
                        {admin.firstName} {admin.lastName}
                      </h3>
                      <p className="mt-1 text-sm text-luxury-text">{admin.email}</p>
                      <p className="mt-1 text-sm text-luxury-text">
                        {admin.phone ?? "-"}
                      </p>
                    </div>
                    <Badge variant="gold">ADMIN</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <AdminStatusBadge active={admin.isActive} />
                    <StatusBadge status={admin.isVerified ? "VERIFIED" : "UNVERIFIED"} />
                    <Badge variant="muted">{formatDate(admin.createdAt)}</Badge>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <IconActionButton
                      href={`/admin/users/${admin.id}`}
                      icon={<Eye size={15} />}
                      label="Voir"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <FormModal
        description="Ajoutez rapidement un administrateur au dashboard."
        footer={
          <>
            <Button disabled={isCreating} onClick={() => setIsCreateOpen(false)} variant="soft">
              Annuler
            </Button>
            <Button disabled={isCreating} form={createAdminFormId} type="submit">
              {isCreating ? "Creation..." : "Creer"}
            </Button>
          </>
        }
        onClose={() => setIsCreateOpen(false)}
        open={isCreateOpen}
        title="Creer un admin"
      >
        <CreateAdminForm
          formId={createAdminFormId}
          hideActions
          onCancel={() => setIsCreateOpen(false)}
          onCreated={(admin) => {
            setIsCreateOpen(false);
            setAdmins((current) => [admin, ...current]);
          }}
          onSubmittingChange={setIsCreating}
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
