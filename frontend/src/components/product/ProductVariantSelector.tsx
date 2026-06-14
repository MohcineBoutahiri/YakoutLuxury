"use client";

import type { ProductVariant } from "@/types/product";
import {
  normalizeColorLabel,
  normalizeSizeLabel,
  uniqueNormalizedColors,
  uniqueNormalizedSizes,
} from "@/lib/variants";

type ProductVariantSelectorProps = {
  variants: ProductVariant[];
  selectedSize?: string;
  selectedColor?: string;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
};

function hasStockForSize(variants: ProductVariant[], size: string) {
  return variants.some(
    (variant) => normalizeSizeLabel(variant.size) === size && variant.stock > 0,
  );
}

function hasStockForColor(
  variants: ProductVariant[],
  color: string,
  selectedSize?: string,
) {
  return variants.some(
    (variant) =>
      normalizeColorLabel(variant.color) === color &&
      (!selectedSize || normalizeSizeLabel(variant.size) === selectedSize) &&
      variant.stock > 0,
  );
}

export function ProductVariantSelector({
  onColorChange,
  onSizeChange,
  selectedColor,
  selectedSize,
  variants,
}: ProductVariantSelectorProps) {
  const sizes = uniqueNormalizedSizes(variants.map((variant) => variant.size));
  const colors = uniqueNormalizedColors(
    variants
      .filter((variant) => !selectedSize || normalizeSizeLabel(variant.size) === selectedSize)
      .map((variant) => variant.color),
  );

  return (
    <div className="grid gap-4">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Taille</p>
          {selectedSize ? (
            <span className="text-xs text-luxury-text">{selectedSize}</span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const isAvailable = hasStockForSize(variants, size);

            return (
              <button
                className="h-9 min-w-11 rounded-md border border-luxury-beige bg-white px-3 text-sm font-semibold transition data-[active=true]:border-luxury-black data-[active=true]:bg-luxury-black data-[active=true]:text-luxury-ivory disabled:cursor-not-allowed disabled:opacity-35"
                data-active={selectedSize === size}
                disabled={!isAvailable}
                key={size}
                onClick={() => onSizeChange(size)}
                type="button"
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Couleur</p>
          {selectedColor ? (
            <span className="text-xs text-luxury-text">{selectedColor}</span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const isAvailable = hasStockForColor(variants, color, selectedSize);

            return (
              <button
                className="h-9 rounded-md border border-luxury-beige bg-white px-3 text-sm font-medium transition data-[active=true]:border-luxury-gold data-[active=true]:bg-luxury-gold data-[active=true]:text-luxury-black disabled:cursor-not-allowed disabled:opacity-35"
                data-active={selectedColor === color}
                disabled={!isAvailable}
                key={color}
                onClick={() => onColorChange(color)}
                type="button"
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
