"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Printer, QrCode, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { adminService } from "@/services/admin.service";
import type { Order } from "@/types/order";

export default function OrderTicketPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { showToast } = useToast();

  const loadTicket = useCallback(() => {
    setIsLoading(true);
    adminService
      .getOrderTicket(params.id)
      .then(setOrder)
      .catch((loadError) => {
        const message = getApiErrorMessage(loadError);
        setError(message);
        showToast("error", message);
      })
      .finally(() => setIsLoading(false));
  }, [params.id, showToast]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  async function handleRegenerateQr() {
    setIsRegenerating(true);
    try {
      const updatedOrder = await adminService.regenerateOrderQr(params.id);
      setOrder(updatedOrder);
      showToast("success", "QR code regenere avec succes.");
    } catch (regenerateError) {
      showToast("error", getApiErrorMessage(regenerateError));
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <AdminLayout title="Ticket commande">
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          .admin-print-shell {
            display: none !important;
          }

          .order-ticket-print {
            display: block !important;
            box-shadow: none !important;
            border: 0 !important;
            margin: 0 !important;
            max-width: 105mm !important;
            width: 105mm !important;
          }

          @page {
            size: A6;
            margin: 8mm;
          }
        }
      `}</style>

      {isLoading ? (
        <Loader label="Preparation du ticket" />
      ) : error || !order ? (
        <EmptyState
          action={
            <Link href="/admin/orders">
              <Button>Retour commandes</Button>
            </Link>
          }
          description={error || "Ticket introuvable."}
          title="Ticket indisponible"
        />
      ) : (
        <div className="mx-auto max-w-3xl">
          <div className="admin-print-shell mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href={`/admin/orders/${order.id}`}>
              <Button variant="soft">
                <ArrowLeft size={16} />
                Retour
              </Button>
            </Link>
            <Button onClick={() => window.print()} variant="dark">
              <Printer size={16} />
              Imprimer
            </Button>
          </div>

          <Card className="order-ticket-print bg-white">
            <CardContent className="p-6 text-luxury-black">
              <header className="border-b border-luxury-beige pb-5 text-center">
                <p className="font-heading text-3xl font-semibold">Yakout Luxury</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-luxury-text">
                  Ticket paquet
                </p>
              </header>

              <section className="mt-5 grid gap-3 text-sm">
                <TicketRow label="Commande" value={order.orderNumber ?? order.id} />
                <TicketRow
                  label="Date"
                  value={new Date(order.createdAt).toLocaleString("fr-FR")}
                />
                <TicketRow
                  label="Client"
                  value={
                    order.user
                      ? `${order.user.firstName} ${order.user.lastName}`
                      : order.userId
                  }
                />
                <TicketRow label="Telephone" value={order.phone} />
                <TicketRow label="Adresse" value={order.shippingAddress} />
                <TicketRow label="Paiement" value="Paiement a la livraison" />
                <div className="flex items-center justify-between">
                  <span className="text-luxury-text">Statut</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </section>

              <section className="mt-5 border-y border-luxury-beige py-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-luxury-text">
                  Produits
                </p>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div className="text-sm" key={item.id}>
                      <div className="flex justify-between gap-3">
                        <span className="font-medium">{item.name}</span>
                        <span>x{item.quantity}</span>
                      </div>
                      <p className="mt-1 text-xs text-luxury-text">
                        {item.variant
                          ? `${item.variant.size} / ${item.variant.color}`
                          : "Piece standard"}
                        {item.sku ? ` - SKU ${item.sku}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-5 flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <PriceDisplay className="text-xl" price={order.totalAmount} />
              </section>

              {order.qrCodeUrl ? (
                <section className="mt-6 text-center">
                  <img
                    alt={`QR code commande ${order.orderNumber ?? order.id}`}
                    className="mx-auto h-36 w-36"
                    src={order.qrCodeUrl}
                  />
                  <p className="mt-3 text-xs font-medium text-luxury-text">
                    Scanner pour changer le statut
                  </p>
                </section>
              ) : (
                <section className="mt-6 rounded-md border border-dashed border-luxury-beige bg-luxury-ivory/50 p-4 text-center">
                  <QrCode className="mx-auto text-luxury-text" size={34} />
                  <p className="mt-3 text-sm font-medium text-luxury-black">
                    QR code indisponible
                  </p>
                  <p className="mt-1 text-xs text-luxury-text">
                    Regenerer le QR code pour imprimer ce ticket complet.
                  </p>
                  <Button
                    className="admin-print-shell mt-4"
                    disabled={isRegenerating}
                    onClick={handleRegenerateQr}
                    size="sm"
                    variant="dark"
                  >
                    <RefreshCw size={15} />
                    {isRegenerating ? "Regeneration..." : "Regenerer QR code"}
                  </Button>
                </section>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-luxury-text">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
