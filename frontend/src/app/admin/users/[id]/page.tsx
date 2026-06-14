"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, MapPin, Phone, Shield, UserRound } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { AuthUser } from "@/types/auth";

export default function AdminUserDetailsPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  function loadUser() {
    setIsLoading(true);
    setError("");
    adminService
      .getUserById(params.id)
      .then(setUser)
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(loadUser, [params.id]);

  async function handleToggleStatus() {
    if (!user) {
      return;
    }

    const nextStatus = !user.isActive;

    if (currentUser?.id === user.id && !nextStatus) {
      showToast("error", "Vous ne pouvez pas desactiver votre propre compte.");
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await adminService.updateUserStatus(user.id, nextStatus);
      setUser(updated);
      showToast("success", nextStatus ? "Compte reactive." : "Compte desactive.");
    } catch (statusError) {
      showToast("error", getApiErrorMessage(statusError));
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <AdminLayout title="Detail utilisateur">
      {isLoading ? (
        <Loader label="Chargement du compte" />
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-luxury-text">{error}</CardContent>
        </Card>
      ) : user ? (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card>
            <CardContent className="p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-luxury-black text-luxury-gold">
                <UserRound size={28} />
              </div>
              <h2 className="mt-5 font-heading text-3xl font-semibold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="mt-1 text-sm text-luxury-text">{user.email}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant={user.role === "ADMIN" ? "gold" : "light"}>
                  {user.role}
                </Badge>
                <AdminStatusBadge active={user.isActive} />
                <StatusBadge status={user.isVerified ? "VERIFIED" : "UNVERIFIED"} />
              </div>
              <Button
                className="mt-6 w-full"
                disabled={isUpdating}
                onClick={handleToggleStatus}
                variant={user.isActive ? "dark" : "gold"}
              >
                {user.isActive ? "Desactiver le compte" : "Reactiver le compte"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <InfoItem icon={Mail} label="Email" value={user.email} />
              <InfoItem icon={Phone} label="Telephone" value={user.phone ?? "-"} />
              <InfoItem icon={MapPin} label="Adresse" value={user.address ?? "-"} />
              <InfoItem icon={Shield} label="Role" value={user.role} />
              <InfoItem label="Date creation" value={formatDate(user.createdAt)} />
              <InfoItem label="Derniere mise a jour" value={formatDate(user.updatedAt)} />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </AdminLayout>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-luxury-beige bg-white p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-luxury-text">
        {Icon ? <Icon size={15} /> : null}
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-medium text-luxury-black">{value}</p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
