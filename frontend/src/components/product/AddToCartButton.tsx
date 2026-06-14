"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import type { Product, ProductVariant } from "@/types/product";

type AddToCartButtonProps = {
  product: Product;
  variant?: ProductVariant;
  disabled?: boolean;
  className?: string;
  label?: string;
  ariaLabel?: string;
  icon?: ReactNode;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "icon";
  buttonVariant?: "primary" | "gold" | "outline" | "dark" | "black" | "ghost" | "soft";
};

export function AddToCartButton({
  ariaLabel,
  buttonVariant = "primary",
  className,
  disabled,
  icon,
  iconOnly = false,
  label = "Ajouter au panier",
  product,
  size = "lg",
  variant,
}: AddToCartButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart, showToast } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      showToast("error", "Connectez-vous pour ajouter au panier.");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      await addToCart({
        productId: product.id,
        variantId: variant?.id,
        quantity: 1,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={className ?? "grid gap-3"}>
      <Button
        aria-label={ariaLabel ?? label}
        disabled={disabled || isSubmitting}
        onClick={handleAddToCart}
        size={size}
        variant={buttonVariant}
      >
        {icon}
        {iconOnly ? (
          <span className="sr-only">{isSubmitting ? "Ajout..." : label}</span>
        ) : isSubmitting ? (
          "Ajout..."
        ) : (
          label
        )}
      </Button>
    </div>
  );
}
