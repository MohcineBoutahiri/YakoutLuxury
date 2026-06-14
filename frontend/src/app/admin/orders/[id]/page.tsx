"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Printer } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { Order, OrderStatus } from "@/types/order";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  function loadOrder() {
    setIsLoading(true);
    adminService
      .getOrderById(params.id)
      .then(setOrder)
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(loadOrder, [params.id]);

  async function handleStatusChange(nextStatus: OrderStatus, note?: string) {
    if (!order) {
      return;
    }

    try {
      await adminService.updateOrderStatus(order.id, nextStatus, note);
      showToast("success", "Statut de commande mis a jour.");
      loadOrder();
    } catch (statusError) {
      showToast("error", getApiErrorMessage(statusError));
    }
  }

  return (
    <AdminLayout title="Detail commande">
      {isLoading ? (
        <Loader label="Chargement de la commande" />
      ) : error || !order ? (
        <EmptyState
          action={
            <Link href="/admin/orders">
              <Button>Retour commandes</Button>
            </Link>
          }
          description={error || "Cette commande est introuvable."}
          title="Commande introuvable"
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="premium-eyebrow">Commande</p>
                    <h1 className="mt-2 font-heading text-4xl font-semibold">
                      {order.orderNumber ?? `#${order.id.slice(0, 8)}`}
                    </h1>
                    <p className="mt-2 text-sm text-luxury-text">
                      Creee le {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="font-heading text-3xl font-semibold">
                  Produits commandes
                </h2>
                <div className="mt-6 grid gap-4">
                  {order.items.map((item) => (
                    <div
                      className="flex items-start gap-4 rounded-md border border-luxury-beige bg-luxury-ivory/45 p-4"
                      key={item.id}
                    >
                      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-luxury-beige">
                        {item.product?.images?.[0] ? (
                          <img
                            alt={item.product.images[0].alt ?? item.name}
                            className="h-full w-full object-cover"
                            src={item.product.images[0].url}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-luxury-black font-heading text-luxury-gold">
                            YL
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-1 text-sm text-luxury-text">
                          {item.quantity} x{" "}
                          {item.variant
                            ? `${item.variant.size} / ${item.variant.color}`
                            : "Piece standard"}
                        </p>
                        {item.sku ? (
                          <p className="mt-2 text-xs uppercase text-luxury-text">
                            SKU {item.sku}
                          </p>
                        ) : null}
                      </div>
                      <PriceDisplay price={Number(item.price) * item.quantity} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-heading text-3xl font-semibold">Gestion</h2>
                <div className="mt-5">
                  <OrderStatusSelect
                    onChange={handleStatusChange}
                    value={order.status}
                  />
                </div>
                <Link className="mt-4 block" href={`/admin/orders/${order.id}/ticket`}>
                  <Button className="w-full" variant="dark">
                    <Printer size={16} />
                    Voir ticket
                  </Button>
                </Link>
                <Link className="mt-4 block" href="/admin/orders">
                  <Button className="w-full" variant="soft">
                    Retour commandes
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="font-heading text-3xl font-semibold">Resume</h2>
                <div className="mt-5 grid gap-3">
                  <SummaryRow label="Client" value={order.user?.email ?? order.userId} />
                  <SummaryRow label="Telephone" value={order.phone} />
                  <SummaryRow label="Adresse" value={order.shippingAddress} />
                  <SummaryRow label="Paiement" value="Paiement a la livraison" />
                  <SummaryRow label="Statut paiement" value={order.paymentStatus} />
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-luxury-beige pt-5">
                  <span className="font-medium">Total</span>
                  <PriceDisplay className="text-2xl" price={order.totalAmount} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="font-heading text-3xl font-semibold">Historique</h2>
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {order.statusHistory.map((history) => (
                      <div
                        className="rounded-md border border-luxury-beige bg-luxury-ivory/45 p-4"
                        key={history.id}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {history.oldStatus ? (
                            <OrderStatusBadge status={history.oldStatus} />
                          ) : null}
                          <span className="text-xs text-luxury-text">vers</span>
                          <OrderStatusBadge status={history.newStatus} />
                        </div>
                        <p className="mt-3 text-sm text-luxury-text">
                          {history.changedBy
                            ? `${history.changedBy.firstName} ${history.changedBy.lastName}`
                            : "Systeme"}{" "}
                          - {history.source} -{" "}
                          {new Date(history.createdAt).toLocaleString("fr-FR")}
                        </p>
                        {history.note ? (
                          <p className="mt-2 text-sm text-luxury-black">{history.note}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-luxury-text">
                    Aucun changement de statut enregistre.
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </AdminLayout>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-luxury-beige bg-luxury-ivory/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-luxury-text">
        {label}
      </p>
      <div className="mt-2 text-sm font-medium text-luxury-black">{value}</div>
    </div>
  );
}
