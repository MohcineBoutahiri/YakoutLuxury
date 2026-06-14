import Link from "next/link";
import { CalendarDays, Eye, Package, Truck } from "lucide-react";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Order } from "@/types/order";
import { OrderStatusBadge } from "./OrderStatusBadge";

type OrderCardProps = {
  order: Order;
};

export function OrderCard({ order }: OrderCardProps) {
  const orderLabel = order.orderNumber ?? `#${order.id.slice(0, 8)}`;

  return (
    <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:border-luxury-gold hover:shadow-luxury">
      <CardContent className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <span className="inline-flex items-center gap-2 text-sm text-luxury-text">
              <CalendarDays className="h-4 w-4" />
              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h2 className="break-words font-heading text-2xl font-semibold">
            Commande {orderLabel}
          </h2>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-luxury-text">
            <Truck className="h-4 w-4" />
            {order.items.length} article(s) - Paiement a la livraison
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex -space-x-3">
              {order.items.slice(0, 4).map((item) => {
                const image = item.product?.images?.[0];

                return (
                  <div
                    className="h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-luxury-beige shadow-sm"
                    key={item.id}
                    title={item.name}
                  >
                    {image ? (
                      <img
                        alt={image.alt ?? item.name}
                        className="h-full w-full object-cover"
                        src={image.url}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-luxury-black text-xs text-luxury-gold">
                        YL
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <span className="inline-flex items-center gap-2 text-sm text-luxury-text">
              <Package className="h-4 w-4" />
              {order.items.length} piece(s)
            </span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center lg:grid-cols-1 lg:justify-items-end">
          <div className="text-xl">
            <PriceDisplay price={order.totalAmount} />
          </div>
          <Link href={`/order/${order.id}`}>
            <Button className="w-full sm:w-auto" size="sm" variant="black">
              <Eye className="h-4 w-4" />
              Voir detail
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
