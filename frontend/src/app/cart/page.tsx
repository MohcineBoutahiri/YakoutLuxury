"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import { useCart } from "@/hooks/useCart";
import type { CartItem } from "@/types/cart";

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}

function CartContent() {
  const { cart, clearCart, isLoading, removeItem, updateQuantity } = useCart();
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const items = cart?.items ?? [];

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    setBusyItemId(itemId);
    await updateQuantity(itemId, quantity);
    setBusyItemId(null);
  }

  async function handleRemoveItem(itemId: string) {
    setBusyItemId(itemId);
    await removeItem(itemId);
    setBusyItemId(null);
  }

  async function handleClearCart() {
    setIsClearing(true);
    await clearCart();
    setIsClearing(false);
  }

  if (isLoading && !cart) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <Loader label="Chargement du panier" />
      </div>
    );
  }

  return (
    <main className="section-surface px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 grid gap-6 rounded-md border border-luxury-beige bg-luxury-dark p-5 text-luxury-ivory shadow-luxury sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="premium-eyebrow inline-flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Panier
            </p>
            <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight sm:text-6xl">
              Votre selection
            </h1>
            <p className="mt-4 max-w-2xl leading-8 text-luxury-beige">
              Ajustez les quantites, verifiez les tailles et confirmez votre
              commande avec paiement a la livraison.
            </p>
          </div>
          {items.length > 0 ? (
            <Button
              className="w-full sm:w-auto"
              disabled={isClearing}
              onClick={handleClearCart}
              variant="outline"
            >
              {isClearing ? "Suppression..." : "Vider le panier"}
            </Button>
          ) : null}
        </section>

        {items.length === 0 ? (
          <EmptyState
            action={
              <Link href="/shop">
                <Button size="lg">Explorer la boutique</Button>
              </Link>
            }
            description="Votre panier est vide. Decouvrez la collection et ajoutez vos pieces favorites."
            title="Aucune piece selectionnee"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
            <section className="grid gap-4">
              <div className="hidden overflow-hidden rounded-md border border-luxury-beige bg-white shadow-luxury-soft xl:block">
                <table className="w-full border-collapse text-left">
                  <thead className="border-b border-luxury-beige bg-luxury-ivory/70 text-xs uppercase text-luxury-text">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Produit</th>
                      <th className="px-5 py-4 font-semibold">Prix</th>
                      <th className="px-5 py-4 font-semibold">Quantite</th>
                      <th className="px-5 py-4 font-semibold">Total</th>
                      <th className="px-5 py-4 font-semibold" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <DesktopCartRow
                        busy={busyItemId === item.id}
                        item={item}
                        key={item.id}
                        onRemove={handleRemoveItem}
                        onUpdateQuantity={handleUpdateQuantity}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 xl:hidden">
                {items.map((item) => (
                  <MobileCartCard
                    busy={busyItemId === item.id}
                    item={item}
                    key={item.id}
                    onRemove={handleRemoveItem}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
              </div>
            </section>

            <CartSummary
              totalAmount={cart?.totalAmount ?? 0}
              totalQuantity={cart?.totalQuantity ?? 0}
            />
          </div>
        )}
      </div>
    </main>
  );
}

type CartItemActions = {
  item: CartItem;
  busy?: boolean;
  onRemove: (itemId: string) => Promise<void>;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
};

function ProductMiniature({ item }: { item: CartItem }) {
  const image = item.product.images?.[0];

  return (
    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
      <Link
        className="h-24 w-20 shrink-0 overflow-hidden rounded-md bg-luxury-beige sm:h-28 sm:w-24"
        href={`/product/${item.product.slug}`}
      >
        {image ? (
          <img
            alt={image.alt ?? item.product.name}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
            src={image.url}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-luxury-black font-heading text-luxury-gold">
            YL
          </div>
        )}
      </Link>
      <div className="min-w-0">
        <Link
          className="font-heading text-xl font-semibold transition hover:text-luxury-gold"
          href={`/product/${item.product.slug}`}
        >
          <span className="line-clamp-2 break-words">{item.product.name}</span>
        </Link>
        <p className="mt-1 text-sm text-luxury-text">
          {item.variant
            ? `${item.variant.size} / ${item.variant.color}`
            : "Piece standard"}
        </p>
        <p className="mt-2 text-xs uppercase text-luxury-text">
          {item.product.category?.name ?? "Collection"}
        </p>
      </div>
    </div>
  );
}

function QuantityControl({
  busy,
  item,
  onUpdateQuantity,
}: Pick<CartItemActions, "busy" | "item" | "onUpdateQuantity">) {
  const maxStock = item.variant?.stock;

  return (
    <div className="inline-flex h-11 items-center rounded-md border border-luxury-beige bg-white">
      <button
        aria-label={`Diminuer la quantite de ${item.product.name}`}
        className="flex h-full w-10 items-center justify-center transition hover:bg-luxury-ivory disabled:opacity-40"
        disabled={busy || item.quantity <= 1}
        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
        type="button"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-10 text-center text-sm">{item.quantity}</span>
      <button
        aria-label={`Augmenter la quantite de ${item.product.name}`}
        className="flex h-full w-10 items-center justify-center transition hover:bg-luxury-ivory disabled:opacity-40"
        disabled={busy || (maxStock ? item.quantity >= maxStock : false)}
        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        type="button"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function DesktopCartRow({
  busy,
  item,
  onRemove,
  onUpdateQuantity,
}: CartItemActions) {
  return (
    <tr className="border-b border-luxury-beige transition hover:bg-luxury-ivory/45 last:border-b-0">
      <td className="px-5 py-5">
        <ProductMiniature item={item} />
      </td>
      <td className="px-5 py-5">
        <PriceDisplay price={item.unitPrice} />
      </td>
      <td className="px-5 py-5">
        <QuantityControl
          busy={busy}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
        />
      </td>
      <td className="px-5 py-5">
        <PriceDisplay price={item.subtotal} />
      </td>
      <td className="px-5 py-5 text-right">
        <button
          aria-label={`Retirer ${item.product.name} du panier`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-luxury-text transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          disabled={busy}
          onClick={() => onRemove(item.id)}
          type="button"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function MobileCartCard({
  busy,
  item,
  onRemove,
  onUpdateQuantity,
}: CartItemActions) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-5 p-5">
        <ProductMiniature item={item} />
        <div className="grid gap-4 rounded-md bg-luxury-ivory p-4 sm:grid-cols-3 sm:items-center">
          <div>
            <p className="text-xs uppercase text-luxury-text">Prix</p>
            <PriceDisplay className="mt-1" price={item.unitPrice} />
          </div>
          <div>
            <p className="mb-2 text-xs uppercase text-luxury-text">Quantite</p>
            <QuantityControl
              busy={busy}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
            />
          </div>
          <div>
            <p className="text-xs uppercase text-luxury-text">Total</p>
            <PriceDisplay className="mt-1" price={item.subtotal} />
          </div>
        </div>
        <button
          aria-label={`Retirer ${item.product.name} du panier`}
          className="inline-flex h-11 items-center gap-2 rounded-md border border-red-100 bg-red-50 px-4 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          disabled={busy}
          onClick={() => onRemove(item.id)}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          {busy ? "Mise a jour..." : "Supprimer cet article"}
        </button>
      </CardContent>
    </Card>
  );
}

function CartSummary({
  totalAmount,
  totalQuantity,
}: {
  totalAmount: number;
  totalQuantity: number;
}) {
  return (
    <Card className="h-fit overflow-hidden lg:sticky lg:top-24">
      <CardContent className="p-5 sm:p-6">
        <p className="premium-eyebrow">Commande</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold">Resume</h2>
        <div className="mt-6 grid gap-4 border-y border-luxury-beige py-5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-luxury-text">Articles</span>
            <span>{totalQuantity}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-luxury-text">Livraison</span>
            <span>A confirmer</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-luxury-text">Paiement</span>
            <span>A la livraison</span>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="font-medium">Total</span>
          <PriceDisplay className="text-2xl" price={totalAmount} />
        </div>
        <div className="mt-5 rounded-md border border-luxury-beige bg-luxury-ivory p-4 text-sm leading-6 text-luxury-text">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-luxury-gold" />
            <p>
              Paiement a la livraison, verification finale de l'adresse au
              checkout.
            </p>
          </div>
        </div>
        <Link className="mt-6 block" href="/checkout">
          <Button className="w-full" size="lg" variant="gold">
            Passer commande
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link
          className="mt-4 block text-center text-sm font-medium text-luxury-text underline decoration-luxury-gold underline-offset-8 transition hover:text-luxury-black"
          href="/shop"
        >
          Continuer mes achats
        </Link>
      </CardContent>
    </Card>
  );
}
