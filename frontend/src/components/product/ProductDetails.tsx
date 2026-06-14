"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Banknote,
  BadgeCheck,
  ChevronRight,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { normalizeColorLabel, normalizeSizeLabel } from "@/lib/variants";
import type { Product, ProductVariant } from "@/types/product";
import { ProductImagesGallery } from "./ProductImagesGallery";
import { ProductRating } from "./ProductRating";
import { ProductReviews } from "./ProductReviews";
import { ProductVariantSelector } from "./ProductVariantSelector";
import { SimilarProducts } from "./SimilarProducts";

type ProductDetailsProps = {
  product: Product;
};

const formatter = new Intl.NumberFormat("fr-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 0,
});

const benefits = [
  {
    icon: <Truck className="h-4 w-4" />,
    title: "Livraison rapide",
    text: "Preparation soignee.",
  },
  {
    icon: <Banknote className="h-4 w-4" />,
    title: "Paiement COD",
    text: "Paiement a la livraison.",
  },
  {
    icon: <RotateCcw className="h-4 w-4" />,
    title: "Retours possibles",
    text: "Accompagnement taille.",
  },
  {
    icon: <BadgeCheck className="h-4 w-4" />,
    title: "Qualite premium",
    text: "Finitions selectionnees.",
  },
];

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  return typeof value === "number" ? value : Number(value);
}

function getDiscount(price: string | number, oldPrice?: string | number | null) {
  const current = toNumber(price);
  const previous = toNumber(oldPrice);

  if (!current || !previous || previous <= current) {
    return null;
  }

  return Math.round(((previous - current) / previous) * 100);
}

function getAvailableStock(variant?: ProductVariant) {
  return variant?.stock ?? 0;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart, showToast } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVariant = useMemo<ProductVariant | undefined>(
    () =>
      product.variants.find(
        (variant) =>
          normalizeSizeLabel(variant.size) === selectedSize &&
          normalizeColorLabel(variant.color) === selectedColor,
      ),
    [product.variants, selectedColor, selectedSize],
  );

  const needsVariant = product.variants.length > 0;
  const availableStock = getAvailableStock(selectedVariant);
  const totalStock = product.variants.reduce(
    (total, variant) => total + variant.stock,
    0,
  );
  const isVariantMissing = needsVariant && !selectedVariant;
  const isOutOfStock = needsVariant ? availableStock <= 0 : totalStock <= 0;
  const canAddToCart = !isVariantMissing && !isOutOfStock && quantity > 0;
  const discount = getDiscount(product.price, product.oldPrice);
  const currentPrice = toNumber(product.price);
  const oldPrice = toNumber(product.oldPrice);

  function handleSizeChange(size: string) {
    setSelectedSize(size);
    setSelectedColor(undefined);
    setQuantity(1);
  }

  function handleColorChange(color: string) {
    setSelectedColor(color);
    setQuantity(1);
  }

  function updateQuantity(nextQuantity: number) {
    const max = selectedVariant ? selectedVariant.stock : Math.max(totalStock, 1);
    setQuantity(Math.min(Math.max(nextQuantity, 1), max));
  }

  async function handleAddToCart(redirectToCheckout = false) {
    if (!isAuthenticated) {
      showToast("error", "Connectez-vous pour ajouter au panier.");
      router.push("/login");
      return;
    }

    if (isVariantMissing) {
      showToast("error", "Selectionnez une taille et une couleur.");
      return;
    }

    if (isOutOfStock) {
      showToast("error", "Ce produit est en rupture de stock.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addToCart({
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity,
      });

      if (redirectToCheckout) {
        router.push("/checkout");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="section-surface px-3 pb-20 pt-4 sm:px-6 sm:pb-10 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <ProductBreadcrumb productName={product.name} />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)] xl:grid-cols-[minmax(0,0.9fr)_430px]">
          <ProductImagesGallery images={product.images} productName={product.name} />

          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="min-w-0 rounded-md border border-luxury-beige bg-white/95 p-4 shadow-luxury-soft sm:p-5 lg:self-start"
            initial={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="light">{product.category?.name ?? "Collection"}</Badge>
              {product.isFeatured ? <Badge variant="gold">Featured</Badge> : null}
              <StockBadge stock={selectedVariant ? availableStock : totalStock} />
            </div>

            <h1 className="mt-3 break-words font-heading text-3xl font-semibold leading-tight sm:text-4xl">
              {product.name}
            </h1>

            <ProductRating
              className="mt-3"
              compact
              initialAverageRating={product.averageRating}
              initialTotalReviews={product.reviewCount}
              productSlug={product.slug}
            />

            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-extrabold text-luxury-black">
                {formatter.format(currentPrice)}
              </span>
              {oldPrice > currentPrice ? (
                <span className="text-sm text-luxury-text line-through">
                  {formatter.format(oldPrice)}
                </span>
              ) : null}
              {discount ? (
                <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-600">
                  -{discount}%
                </span>
              ) : null}
            </div>

            <p className="mt-3 line-clamp-3 text-sm leading-6 text-luxury-text">
              {product.description}
            </p>

            <div className="mt-5 rounded-md border border-luxury-beige bg-luxury-ivory/65 p-4">
              {needsVariant ? (
                <ProductVariantSelector
                  onColorChange={handleColorChange}
                  onSizeChange={handleSizeChange}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  variants={product.variants}
                />
              ) : (
                <p className="text-sm text-luxury-text">
                  Produit disponible sans variante.
                </p>
              )}

              <div className="mt-4 flex flex-col gap-3 border-t border-luxury-beige pt-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                <QuantityControl
                  disabled={isOutOfStock}
                  onChange={updateQuantity}
                  quantity={quantity}
                  selectedVariant={selectedVariant}
                  totalStock={totalStock}
                />
                <div className="rounded-md border border-luxury-beige bg-white px-3 py-2 text-sm min-[420px]:text-right">
                  <p className="font-medium text-luxury-black">Stock</p>
                  <p className="mt-0.5 text-xs text-luxury-text">
                    {selectedVariant
                      ? `${availableStock} piece(s) disponible(s)`
                      : needsVariant
                        ? "Choisissez taille et couleur"
                        : `${totalStock} piece(s) disponible(s)`}
                  </p>
                </div>
              </div>
            </div>

            {isVariantMissing ? (
              <p className="mt-3 rounded-md border border-luxury-beige bg-white px-3 py-2 text-xs text-luxury-text">
                Selectionnez une taille et une couleur avant d'ajouter au panier.
              </p>
            ) : null}

            <PurchaseActions
              canAddToCart={canAddToCart}
              isSubmitting={isSubmitting}
              onAddToCart={() => handleAddToCart(false)}
              onBuyNow={() => handleAddToCart(true)}
            />

            <ProductBenefitsCompact />
          </motion.section>
        </div>

        <ProductDescription product={product} selectedVariant={selectedVariant} />
        <ProductReviews productSlug={product.slug} />
        <SimilarProducts product={product} />
      </div>

      <MobilePurchaseBar
        canAddToCart={canAddToCart}
        isSubmitting={isSubmitting}
        onAddToCart={() => handleAddToCart(false)}
        onBuyNow={() => handleAddToCart(true)}
        price={currentPrice}
      />
    </main>
  );
}

function ProductBreadcrumb({ productName }: { productName: string }) {
  return (
    <nav className="mb-3 flex min-w-0 items-center gap-1.5 text-xs text-luxury-text">
      <Link className="transition hover:text-luxury-black" href="/">
        Accueil
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <Link className="transition hover:text-luxury-black" href="/shop">
        Boutique
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <span className="truncate text-luxury-black">{productName}</span>
    </nav>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return <Badge variant="danger">Rupture</Badge>;
  }

  if (stock <= 3) {
    return <Badge variant="gold">Stock faible</Badge>;
  }

  return <Badge variant="success">En stock</Badge>;
}

function QuantityControl({
  disabled,
  onChange,
  quantity,
  selectedVariant,
  totalStock,
}: {
  disabled: boolean;
  onChange: (quantity: number) => void;
  quantity: number;
  selectedVariant?: ProductVariant;
  totalStock: number;
}) {
  const maxStock = selectedVariant ? selectedVariant.stock : totalStock;

  return (
    <div>
      <p className="text-sm font-medium text-luxury-black">Quantite</p>
      <div className="mt-1.5 inline-flex h-10 items-center rounded-md border border-luxury-beige bg-white">
        <button
          aria-label="Diminuer la quantite"
          className="flex h-full w-10 items-center justify-center transition hover:bg-luxury-ivory disabled:opacity-40"
          disabled={disabled || quantity <= 1}
          onClick={() => onChange(quantity - 1)}
          type="button"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-10 text-center text-sm">{quantity}</span>
        <button
          aria-label="Augmenter la quantite"
          className="flex h-full w-10 items-center justify-center transition hover:bg-luxury-ivory disabled:opacity-40"
          disabled={disabled || quantity >= maxStock}
          onClick={() => onChange(quantity + 1)}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PurchaseActions({
  canAddToCart,
  isSubmitting,
  onAddToCart,
  onBuyNow,
}: {
  canAddToCart: boolean;
  isSubmitting: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}) {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      <Button
        className="h-12 w-full"
        disabled={!canAddToCart || isSubmitting}
        onClick={onAddToCart}
        variant="gold"
      >
        <ShoppingBag className="h-4 w-4" />
        {isSubmitting ? "Ajout..." : "Ajouter au panier"}
      </Button>
      <Button
        className="h-12 w-full"
        disabled={!canAddToCart || isSubmitting}
        onClick={onBuyNow}
        variant="black"
      >
        Acheter maintenant
      </Button>
    </div>
  );
}

function ProductBenefitsCompact() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-luxury-beige pt-4">
      {benefits.map((benefit) => (
        <div
          className="rounded-md border border-luxury-beige bg-white p-3"
          key={benefit.title}
        >
          <div className="flex items-center gap-2">
            <span className="text-luxury-gold">{benefit.icon}</span>
            <p className="text-sm font-semibold">{benefit.title}</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-luxury-text">{benefit.text}</p>
        </div>
      ))}
    </div>
  );
}

function ProductDescription({
  product,
  selectedVariant,
}: {
  product: Product;
  selectedVariant?: ProductVariant;
}) {
  return (
    <section className="mt-6 rounded-md border border-luxury-beige bg-white/95 p-4 shadow-luxury-soft sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="premium-eyebrow">Details</p>
          <h2 className="mt-1 font-heading text-2xl font-semibold">Description</h2>
          <p className="mt-3 text-sm leading-7 text-luxury-text">
            {product.description}
          </p>
        </div>
        <div className="grid gap-2 text-sm">
          <DetailRow label="Categorie" value={product.category?.name ?? "Collection"} />
          <DetailRow label="SKU" value={selectedVariant?.sku ?? "A selectionner"} />
          <DetailRow
            label="Stock"
            value={
              selectedVariant
                ? `${selectedVariant.stock} disponible(s)`
                : `${product.variants.reduce((total, variant) => total + variant.stock, 0)} total`
            }
          />
          <DetailRow label="Paiement" value="A la livraison" />
        </div>
      </div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-luxury-beige bg-luxury-ivory/50 px-3 py-2">
      <span className="text-luxury-text">{label}</span>
      <span className="text-right font-medium text-luxury-black">{value}</span>
    </div>
  );
}

function MobilePurchaseBar({
  canAddToCart,
  isSubmitting,
  onAddToCart,
  onBuyNow,
  price,
}: {
  canAddToCart: boolean;
  isSubmitting: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
  price: number;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-luxury-beige bg-white/95 px-3 py-2 shadow-luxury backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-[minmax(0,0.7fr)_1fr_1fr] items-center gap-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase text-luxury-text">Prix</p>
          <p className="truncate text-sm font-extrabold text-luxury-black">
            {formatter.format(price)}
          </p>
        </div>
        <Button
          className="h-10 px-2 text-xs"
          disabled={!canAddToCart || isSubmitting}
          onClick={onAddToCart}
          variant="gold"
        >
          Panier
        </Button>
        <Button
          className="h-10 px-2 text-xs"
          disabled={!canAddToCart || isSubmitting}
          onClick={onBuyNow}
          variant="black"
        >
          Acheter
        </Button>
      </div>
    </div>
  );
}
