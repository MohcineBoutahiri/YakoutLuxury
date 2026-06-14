"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { logout, user } = useAuth();

  if (!user) {
    return null;
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const initials = `${user.firstName?.[0] ?? "Y"}${user.lastName?.[0] ?? ""}`;

  return (
    <main className="section-surface px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-md border border-luxury-beige bg-luxury-dark p-5 text-luxury-ivory shadow-luxury sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="premium-eyebrow">Espace client</p>
              <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight sm:text-6xl">
                Mon profil
              </h1>
              <p className="mt-4 max-w-2xl leading-8 text-luxury-beige">
                Retrouvez vos informations personnelles et accedez rapidement a
                vos commandes Yakout Luxury.
              </p>
            </div>
            <Link href="/my-orders">
              <Button className="w-full sm:w-auto" variant="outline">
                <ShoppingBag className="h-4 w-4" />
                Mes commandes
              </Button>
            </Link>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <Card className="h-fit overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-luxury-gold bg-luxury-black font-heading text-4xl text-luxury-gold shadow-luxury-soft">
                {initials}
              </div>
              <h2 className="mt-5 font-heading text-3xl font-semibold">
                {fullName}
              </h2>
              <p className="mt-2 text-sm text-luxury-text">{user.email}</p>
              <div className="mt-5 flex justify-center gap-2">
                <Badge variant={user.isVerified ? "success" : "muted"}>
                  {user.isVerified ? "Compte verifie" : "Non verifie"}
                </Badge>
                <Badge variant={user.isActive ? "gold" : "danger"}>
                  {user.isActive ? "Actif" : "Desactive"}
                </Badge>
              </div>
              <div className="mt-6 grid gap-3">
                <Link href="/my-orders">
                  <Button className="w-full" variant="black">
                    <ShoppingBag className="h-4 w-4" />
                    Mes commandes
                  </Button>
                </Link>
                <Button className="w-full" disabled variant="soft">
                  <UserRound className="h-4 w-4" />
                  Modifier profil indisponible
                </Button>
                <Button className="w-full" onClick={logout} variant="ghost">
                  <LogOut className="h-4 w-4" />
                  Deconnexion
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6">
                <p className="premium-eyebrow">Coordonnees</p>
                <h2 className="mt-2 font-heading text-3xl font-semibold">
                  Informations personnelles
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileField
                  icon={<UserRound className="h-4 w-4" />}
                  label="Prenom"
                  value={user.firstName}
                />
                <ProfileField
                  icon={<UserRound className="h-4 w-4" />}
                  label="Nom"
                  value={user.lastName}
                />
                <ProfileField
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={user.email}
                />
                <ProfileField
                  icon={<Phone className="h-4 w-4" />}
                  label="Telephone"
                  value={user.phone ?? "Non renseigne"}
                />
                <ProfileField
                  className="sm:col-span-2"
                  icon={<MapPin className="h-4 w-4" />}
                  label="Adresse"
                  value={user.address ?? "Non renseignee"}
                />
                <ProfileField
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Role"
                  value={user.role}
                />
                <ProfileField
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Verification"
                  value={user.isVerified ? "Compte verifie" : "Compte non verifie"}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function ProfileField({
  className,
  icon,
  label,
  value,
}: {
  className?: string;
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className={`rounded-md border border-luxury-beige bg-white p-5 ${className ?? ""}`}>
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.06em] text-luxury-text">
        {icon ? <span className="text-luxury-gold">{icon}</span> : null}
        {label}
      </p>
      <p className="mt-2 font-medium text-luxury-black">{value}</p>
    </div>
  );
}
