"use client";

import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CreateAdminForm } from "@/components/admin/CreateAdminForm";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateAdminPage() {
  const router = useRouter();

  return (
    <AdminLayout title="Creer un admin">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <p className="mb-6 text-sm leading-6 text-luxury-text">
            Ce compte aura acces au dashboard et aux actions d'administration.
          </p>
          <CreateAdminForm
            onCancel={() => router.push("/admin/users")}
            onCreated={() => router.push("/admin/users")}
          />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
