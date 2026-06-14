"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, Check, Clock, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/cn";
import { getApiErrorMessage } from "@/services/api";
import { orderService } from "@/services/order.service";
import type { Order, OrderStatus } from "@/types/order";

const timeline: Array<{ status: OrderStatus; label: string }> = [
  { status: "PENDING", label: "Commande creee" },
  { status: "CONFIRMED", label: "Confirmee" },
  { status: "PROCESSING", label: "Preparation" },
  { status: "SHIPPED", label: "Expediee" },
  { status: "DELIVERED", label: "Livree" },
];

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}

function OrderDetailContent() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    orderService
      .getOrderById(params.id)
      .then(setOrder)
      .catch((loadError) => setError(getApiErrorMessage(loadError)))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <Loader label="Chargement de la commande" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <main className="section-surface px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            action={
              <Link href="/my-orders">
                <Button>Retour commandes</Button>
              </Link>
            }
            description={error || "Cette commande est introuvable."}
            title="Commande introuvable"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="section-surface px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-md border border-luxury-beige bg-luxury-dark p-5 text-luxury-ivory shadow-luxury sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="premium-eyebrow">Commande</p>
              <h1 className="mt-3 break-all font-heading text-4xl font-semibold leading-tight sm:text-6xl">
                {order.orderNumber ?? `#${order.id.slice(0, 8)}`}
              </h1>
              <p className="mt-4 inline-flex items-center gap-2 text-luxury-beige">
                <CalendarDays className="h-4 w-4" />
                Creee le{" "}
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          <section className="grid gap-6">
            <Card>
              <CardContent className="p-5 sm:p-6">
                <h2 className="font-heading text-3xl font-semibold">
                  Produits commandes
                </h2>
                <div className="mt-6 grid gap-5">
                  {order.items.map((item) => (
                    <div
                      className="grid gap-4 rounded-md border border-luxury-beige bg-luxury-ivory/45 p-4 min-[460px]:grid-cols-[80px_minmax(0,1fr)_auto] min-[460px]:items-start"
                      key={item.id}
                    >
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-md bg-luxury-beige">
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
                        <p className="font-heading text-xl font-semibold">
                          {item.name}
                        </p>
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
                      <PriceDisplay className="min-[460px]:text-right" price={Number(item.price) * item.quantity} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 sm:p-6">
                <h2 className="font-heading text-3xl font-semibold">
                  Suivi de commande
                </h2>
                <OrderTimeline status={order.status} />
              </CardContent>
            </Card>

            {order.statusHistory?.length ? (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <h2 className="font-heading text-3xl font-semibold">
                    Historique des statuts
                  </h2>
                  <div className="mt-6 grid gap-3">
                    {order.statusHistory.map((history) => (
                      <div
                        className="rounded-md border border-luxury-beige bg-white p-4"
                        key={history.id}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            {history.oldStatus ? (
                              <OrderStatusBadge status={history.oldStatus} />
                            ) : null}
                            <span className="text-luxury-text">vers</span>
                            <OrderStatusBadge status={history.newStatus} />
                          </div>
                          <span className="text-sm text-luxury-text">
                            {new Date(history.createdAt).toLocaleString("fr-FR")}
                          </span>
                        </div>
                        {history.note ? (
                          <p className="mt-3 text-sm leading-6 text-luxury-text">
                            {history.note}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </section>

          <Card className="h-fit lg:sticky lg:top-24">
            <CardContent className="p-5 sm:p-6">
              <p className="premium-eyebrow">Resume</p>
              <h2 className="mt-2 font-heading text-3xl font-semibold">
                Livraison
              </h2>
              <div className="mt-6 grid gap-4 text-sm">
                <SummaryRow label="Statut" value={<OrderStatusBadge status={order.status} />} />
                <SummaryRow icon={<MapPin className="h-4 w-4" />} label="Adresse" value={order.shippingAddress} />
                <SummaryRow icon={<Phone className="h-4 w-4" />} label="Telephone" value={order.phone} />
                <SummaryRow icon={<ShieldCheck className="h-4 w-4" />} label="Paiement" value="Paiement a la livraison" />
                <SummaryRow label="Statut paiement" value={order.paymentStatus} />
              </div>
              <div className="mt-6 border-t border-luxury-beige pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium">Total</span>
                  <PriceDisplay className="text-2xl" price={order.totalAmount} />
                </div>
              </div>
              <Link className="mt-6 block" href="/my-orders">
                <Button className="w-full" variant="black">
                  Toutes mes commandes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-md border border-luxury-beige bg-luxury-ivory/60 p-4">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.06em] text-luxury-text">
        {icon ? <span className="text-luxury-gold">{icon}</span> : null}
        {label}
      </p>
      <div className="mt-2 font-medium text-luxury-black">{value}</div>
    </div>
  );
}

function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIndex =
    status === "CANCELLED"
      ? -1
      : timeline.findIndex((item) => item.status === status);

  if (status === "CANCELLED") {
    return (
      <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Cette commande a ete annulee.
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-5">
      {timeline.map((item, index) => {
        const isDone = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div className="relative rounded-md border border-luxury-beige bg-luxury-ivory/45 p-4" key={item.status}>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold",
                isDone
                  ? "border-luxury-gold bg-luxury-gold text-luxury-black"
                  : "border-luxury-beige bg-white text-luxury-text",
              )}
            >
              {isDone ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <p className="mt-3 text-sm font-medium">{item.label}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-luxury-text">
              {isCurrent ? (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  En cours
                </>
              ) : isDone ? (
                <>
                  <Truck className="h-3.5 w-3.5" />
                  Termine
                </>
              ) : (
                "A venir"
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}
