"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { Order, OrderStatus } from "@/types/order";

const statuses: OrderStatus[] = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const labels: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmer",
  PROCESSING: "Preparation",
  SHIPPED: "Expedier",
  DELIVERED: "Livrer",
  CANCELLED: "Annuler",
};

export default function AdminOrderScanPage() {
  const params = useParams<{ qrToken: string }>();
  const router = useRouter();
  const { isAdmin, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      window.localStorage.setItem(
        "yakout_post_login_redirect",
        `/admin/scan/order/${params.qrToken}`,
      );
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, isAuthenticated, isAuthLoading, params.qrToken, router]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !isAdmin) {
      return;
    }

    adminService
      .getOrderByQrToken(params.qrToken)
      .then(setOrder)
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }, [isAdmin, isAuthenticated, isAuthLoading, params.qrToken, showToast]);

  async function confirmStatusChange() {
    if (!selectedStatus) {
      return;
    }

    setIsUpdating(true);
    try {
      const updatedOrder = await adminService.updateScannedOrderStatus(
        params.qrToken,
        selectedStatus,
        "Changement rapide depuis scan QR.",
      );
      setOrder(updatedOrder);
      setSelectedStatus(null);
      showToast("success", "Statut de commande mis a jour.");
    } catch (updateError) {
      showToast("error", getApiErrorMessage(updateError));
    } finally {
      setIsUpdating(false);
    }
  }

  if (isAuthLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-luxury-surface px-5">
        <Loader label="Verification des acces" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-luxury-surface px-4 py-5">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="rounded-md bg-luxury-black p-5 text-luxury-ivory">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-luxury-gold text-luxury-black">
              <ShieldCheck size={20} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-luxury-gold">
                Scan commande
              </p>
              <h1 className="font-heading text-3xl font-semibold">Yakout Luxury</h1>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Loader label="Chargement de la commande" />
        ) : error || !order ? (
          <EmptyState
            description={error || "Ce QR code ne correspond a aucune commande."}
            title="Commande introuvable"
          />
        ) : (
          <>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-luxury-text">
                      Commande
                    </p>
                    <h2 className="mt-1 font-heading text-3xl font-semibold">
                      {order.orderNumber ?? `#${order.id.slice(0, 8)}`}
                    </h2>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-5 grid gap-3 text-sm">
                  <InfoRow
                    label="Client"
                    value={
                      order.user
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : order.userId
                    }
                  />
                  <InfoRow label="Telephone" value={order.phone} />
                  <InfoRow label="Adresse" value={order.shippingAddress} />
                  <div className="flex items-center justify-between rounded-md border border-luxury-beige bg-luxury-ivory/50 p-3">
                    <span className="text-luxury-text">Total</span>
                    <PriceDisplay price={order.totalAmount} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-luxury-gold" size={18} />
                  <h2 className="font-heading text-2xl font-semibold">
                    Changer le statut
                  </h2>
                </div>
                <div className="grid gap-2">
                  {statuses.map((status) => (
                    <Button
                      disabled={status === order.status}
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      variant={status === "CANCELLED" ? "soft" : "dark"}
                    >
                      {labels[status]}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmModal
        confirmLabel="Changer le statut"
        description={`Confirmer le passage de la commande vers ${selectedStatus ?? ""} ?`}
        isLoading={isUpdating}
        onCancel={() => setSelectedStatus(null)}
        onConfirm={confirmStatusChange}
        open={Boolean(selectedStatus)}
        title="Confirmer le changement"
      />
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-luxury-beige bg-luxury-ivory/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-luxury-text">
        {label}
      </p>
      <p className="mt-1 font-medium text-luxury-black">{value}</p>
    </div>
  );
}
