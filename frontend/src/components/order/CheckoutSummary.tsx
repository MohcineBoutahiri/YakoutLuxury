import { Banknote, Package, ShieldCheck } from "lucide-react";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { Card, CardContent } from "@/components/ui/card";
import type { Cart } from "@/types/cart";

type CheckoutSummaryProps = {
  cart: Cart | null;
  discountAmount?: number;
  finalTotal?: number;
  couponCode?: string;
};

export function CheckoutSummary({
  cart,
  couponCode,
  discountAmount = 0,
  finalTotal,
}: CheckoutSummaryProps) {
  const items = cart?.items ?? [];
  const total = finalTotal ?? cart?.totalAmount ?? 0;

  return (
    <Card className="h-fit overflow-hidden lg:sticky lg:top-24">
      <CardContent className="p-5 sm:p-6">
        <p className="premium-eyebrow">Votre commande</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold">Resume</h2>
        <div className="mt-6 grid gap-4">
          {items.map((item) => (
            <div
              className="rounded-md border border-luxury-beige bg-luxury-ivory/50 p-3"
              key={item.id}
            >
              <div className="grid gap-4 min-[420px]:grid-cols-[64px_minmax(0,1fr)_auto] min-[420px]:items-start">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-luxury-beige">
                  {item.product.images?.[0] ? (
                    <img
                      alt={item.product.images[0].alt ?? item.product.name}
                      className="h-full w-full object-cover"
                      src={item.product.images[0].url}
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="break-words font-medium">{item.product.name}</p>
                  <p className="mt-1 text-sm text-luxury-text">
                    {item.quantity} x{" "}
                    {item.variant
                      ? `${item.variant.size} / ${item.variant.color}`
                      : "Piece standard"}
                  </p>
                </div>
                <PriceDisplay className="min-[420px]:text-right" price={item.subtotal} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-md border border-luxury-beige bg-white p-5">
          <div className="flex items-center justify-between gap-4 text-sm text-luxury-text">
            <span className="inline-flex items-center gap-2">
              <Package className="h-4 w-4 text-luxury-gold" />
              Articles
            </span>
            <span>{cart?.totalQuantity ?? items.length}</span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 text-sm text-luxury-text">
            <span className="inline-flex items-center gap-2">
              <Banknote className="h-4 w-4 text-luxury-gold" />
              Paiement
            </span>
            <span>A la livraison</span>
          </div>
          {couponCode ? (
            <div className="mt-4 flex items-center justify-between gap-4 text-sm text-luxury-text">
              <span>Coupon {couponCode}</span>
              <PriceDisplay price={-discountAmount} />
            </div>
          ) : null}
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="font-medium">Total</span>
            <PriceDisplay className="text-xl" price={total} />
          </div>
        </div>
        <div className="mt-4 rounded-md bg-luxury-dark p-4 text-sm leading-6 text-luxury-beige">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-luxury-gold" />
            <p>Confirmation rapide par telephone avant expedition.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
