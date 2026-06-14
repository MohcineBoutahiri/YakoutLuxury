"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Banknote, PackageCheck, ShoppingBag } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { OrderCard } from "@/components/order/OrderCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { getApiErrorMessage } from "@/services/api";
import { orderService } from "@/services/order.service";
import type { Order } from "@/types/order";

export default function MyOrdersPage() {
  return (
    <ProtectedRoute>
      <MyOrdersContent />
    </ProtectedRoute>
  );
}

function MyOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    orderService
      .getMyOrders()
      .then(setOrders)
      .catch((loadError) => setError(getApiErrorMessage(loadError)))
      .finally(() => setIsLoading(false));
  }, []);

  const totalAmount = useMemo(
    () =>
      orders.reduce((total, order) => {
        const value =
          typeof order.totalAmount === "number"
            ? order.totalAmount
            : Number(order.totalAmount);
        return total + value;
      }, 0),
    [orders],
  );

  return (
    <main className="section-surface px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-md border border-luxury-beige bg-luxury-dark p-5 text-luxury-ivory shadow-luxury sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="premium-eyebrow">Commandes</p>
              <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight sm:text-6xl">
                Mes commandes
              </h1>
              <p className="mt-4 max-w-2xl leading-8 text-luxury-beige">
                Suivez vos commandes, leurs statuts et les details de livraison.
              </p>
            </div>
            <div className="grid gap-3 rounded-md border border-luxury-ivory/10 bg-white/5 p-4 text-sm text-luxury-beige sm:grid-cols-2">
              <div className="rounded-md bg-white/5 p-3">
                <p className="inline-flex items-center gap-2 text-luxury-gold">
                  <ShoppingBag className="h-4 w-4" />
                  Commandes
                </p>
                <p className="mt-1 font-heading text-3xl text-luxury-ivory">
                  {orders.length}
                </p>
              </div>
              <div className="rounded-md bg-white/5 p-3">
                <p className="inline-flex items-center gap-2 text-luxury-gold">
                  <Banknote className="h-4 w-4" />
                  Total
                </p>
                <p className="mt-1 font-heading text-3xl text-luxury-ivory">
                  {totalAmount.toLocaleString("fr-FR")} MAD
                </p>
              </div>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader label="Chargement des commandes" />
          </div>
        ) : error ? (
          <EmptyState description={error} title="Impossible de charger" />
        ) : orders.length === 0 ? (
          <EmptyState
            action={
              <Link href="/shop">
                <Button size="lg">Explorer la boutique</Button>
              </Link>
            }
            description="Aucune commande n'a encore ete creee."
            title="Aucune commande"
          />
        ) : (
          <div className="grid gap-4">
            <div className="rounded-md border border-luxury-beige bg-white p-4 text-sm text-luxury-text shadow-luxury-soft">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-luxury-gold" />
                  Historique complet avec statut de livraison.
                </span>
                <Link
                  className="font-medium text-luxury-black underline decoration-luxury-gold underline-offset-8 transition hover:text-luxury-gold"
                  href="/shop"
                >
                  Continuer la boutique
                </Link>
              </div>
            </div>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
