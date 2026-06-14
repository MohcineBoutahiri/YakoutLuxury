"use client";

import { motion } from "framer-motion";
import { EmptyState } from "@/components/ui/empty-state";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <EmptyState
          description="Aucun produit actif ne correspond aux criteres selectionnes."
          title="Aucun produit trouve"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      animate="visible"
      className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
      initial="hidden"
      variants={staggerContainer}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </motion.div>
  );
}
