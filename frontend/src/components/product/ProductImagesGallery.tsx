"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ProductImage } from "@/types/product";

type ProductImagesGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductImagesGallery({
  images,
  productName,
}: ProductImagesGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div className="grid min-w-0 gap-3 lg:sticky lg:top-24 lg:self-start">
      <motion.div
        className="group overflow-hidden rounded-md border border-luxury-beige bg-luxury-beige shadow-luxury-soft"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {activeImage ? (
          <img
            alt={activeImage.alt ?? productName}
            className="aspect-[4/5] max-h-[560px] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            src={activeImage.url}
          />
        ) : (
          <div className="flex aspect-[4/5] max-h-[560px] items-center justify-center bg-luxury-black font-heading text-4xl text-luxury-gold">
            Yakout
          </div>
        )}
      </motion.div>

      {images.length > 1 ? (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
          {images.map((image, index) => (
            <button
              className="aspect-square w-16 shrink-0 overflow-hidden rounded-md border border-luxury-beige bg-white transition hover:border-luxury-gold data-[active=true]:border-luxury-gold data-[active=true]:ring-2 data-[active=true]:ring-luxury-gold/25 sm:w-auto"
              data-active={index === activeIndex}
              key={image.id}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <img
                alt={image.alt ?? productName}
                className="h-full w-full object-cover"
                src={image.url}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
