"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { smoothTransition } from "@/lib/motion";
import { uniqueNormalizedColors, uniqueNormalizedSizes } from "@/lib/variants";
import type { Product } from "@/types/product";
import { AddToCartButton } from "./AddToCartButton";
import { ProductRating } from "./ProductRating";

type ProductCardProps = {
  product: Product;
};

const formatter = new Intl.NumberFormat("fr-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 0,
});

const colorSwatches: Record<string, string> = {
  Beige: "#E8DED0",
  Blanc: "#F8F5EF",
  Bleu: "#23466F",
  Dore: "#C8A24A",
  Gris: "#8B8B8B",
  Marron: "#6B4F3A",
  Noir: "#0B0B0B",
  Orange: "#D97706",
  Rose: "#D48CA7",
  Rouge: "#B42318",
  Vert: "#2F6B4F",
  Violet: "#6D4A8D",
};

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
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

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0];
  const stock = product.variants.reduce((total, variant) => total + variant.stock, 0);
  const allColors = uniqueNormalizedColors(
    product.variants.map((variant) => variant.color),
  );
  const colors = allColors.slice(0, 3);
  const sizes = uniqueNormalizedSizes(
    product.variants.map((variant) => variant.size),
  ).slice(0, 4);
  const simpleVariant =
    product.variants.length === 1 && product.variants[0].stock > 0
      ? product.variants[0]
      : undefined;
  const isNew = product.createdAt
    ? Date.now() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 30
    : false;
  const discount = getDiscount(product.price, product.oldPrice);
  const currentPrice = toNumber(product.price) ?? 0;
  const oldPrice = toNumber(product.oldPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      transition={smoothTransition}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -3 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className="group flex h-full flex-col overflow-hidden rounded-md border-luxury-beige/90 bg-white transition duration-300 hover:border-luxury-gold hover:shadow-luxury-soft">
        <div className="relative aspect-[5/4] overflow-hidden bg-luxury-beige">
          <Link
            aria-label={`Voir le produit ${product.name}`}
            className="block h-full"
            href={`/product/${product.slug}`}
          >
            {image ? (
              <motion.img
                alt={image.alt ?? product.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]"
                loading="lazy"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                src={image.url}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-luxury-black px-5 text-center font-heading text-2xl text-luxury-gold">
                Yakout
              </div>
            )}
          </Link>
          <div className="absolute left-1.5 top-1.5 z-10 flex flex-wrap gap-1">
              {discount ? (
                <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  -{discount}%
                </span>
              ) : null}
              {isNew ? <Badge className="px-1.5 py-0.5 text-[9px]" variant="dark">New</Badge> : null}
              {product.isFeatured ? <Badge className="px-1.5 py-0.5 text-[9px]" variant="gold">Top</Badge> : null}
              {stock <= 0 ? <Badge className="px-1.5 py-0.5 text-[9px]" variant="danger">Rupture</Badge> : null}
          </div>
          {simpleVariant ? (
            <AddToCartButton
              ariaLabel={`Ajouter ${product.name} au panier`}
              buttonVariant="gold"
              className="absolute bottom-1.5 right-1.5 z-10"
              icon={<ShoppingBag className="h-3.5 w-3.5" />}
              iconOnly
              label="Ajouter au panier"
              product={product}
              size="icon"
              variant={simpleVariant}
            />
          ) : (
            <Link
              aria-label={`Choisir une variante pour ${product.name}`}
              className="absolute bottom-1.5 right-1.5 z-10 inline-flex h-8 items-center gap-1 rounded-md border border-luxury-beige bg-white/95 px-2 text-[11px] font-semibold text-luxury-black shadow-sm transition hover:border-luxury-gold hover:bg-luxury-gold"
              href={`/product/${product.slug}`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Choisir
            </Link>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col p-2">
          <div className="mb-0.5 flex items-center justify-between gap-2">
            <p className="truncate text-[9px] uppercase text-luxury-text">
              {product.category?.name ?? "Collection"}
            </p>
            <span className="shrink-0 text-[9px] text-luxury-text">
              {stock > 0 ? `${stock} dispo.` : "Indisponible"}
            </span>
          </div>

          <Link href={`/product/${product.slug}`}>
            <h3 className="line-clamp-1 min-h-[1.05rem] text-[12px] font-semibold leading-[1.05rem] transition group-hover:text-luxury-gold">
              {product.name}
            </h3>
          </Link>

          <ProductRating
            className="mt-1 scale-[0.88] origin-left"
            compact
            initialAverageRating={product.averageRating}
            initialTotalReviews={product.reviewCount}
            productSlug={product.slug}
          />

          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1 gap-y-0">
            <span className="text-sm font-extrabold text-luxury-black">
              {formatter.format(currentPrice)}
            </span>
            {oldPrice && oldPrice > currentPrice ? (
              <span className="text-[10px] text-luxury-text line-through">
                {formatter.format(oldPrice)}
              </span>
            ) : null}
            {discount ? (
              <span className="rounded-full bg-red-50 px-1 py-0.5 text-[8px] font-bold text-red-600">
                -{discount}%
              </span>
            ) : null}
          </div>

          <div className="mt-1 flex min-h-3.5 items-center justify-between gap-2">
            {colors.length > 0 ? (
              <div className="flex items-center gap-1">
                {colors.map((color) => (
                  <span
                    aria-label={color}
                    className="h-3 w-3 rounded-full border border-luxury-beige shadow-sm"
                    key={color}
                    style={{ backgroundColor: colorSwatches[color] ?? "#E8DED0" }}
                    title={color}
                  />
                ))}
                {allColors.length > 3 ? (
                  <span className="text-[9px] text-luxury-text">
                    +{allColors.length - 3}
                  </span>
                ) : null}
              </div>
            ) : (
              <span />
            )}
            {product.soldCount ? (
              <span className="text-[9px] text-luxury-text">
                {product.soldCount} vendus
              </span>
            ) : null}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
            <div className="flex min-w-0 flex-wrap gap-1">
              {sizes.slice(0, 3).map((size) => (
                <span
                  className="rounded border border-luxury-beige bg-luxury-ivory px-1 py-0 text-[8px] font-semibold text-luxury-text"
                  key={size}
                >
                  {size}
                </span>
              ))}
              {sizes.length > 3 ? (
                <span className="text-[9px] text-luxury-text">+{sizes.length - 3}</span>
              ) : null}
            </div>
            <Link href={`/product/${product.slug}`}>
              <Button
                aria-label={`Voir les details de ${product.name}`}
                className="h-7 w-7 shrink-0"
                size="icon"
                variant="ghost"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
