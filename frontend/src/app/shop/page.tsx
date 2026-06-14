"use client";

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Truck,
  WalletCards,
  X,
} from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { fadeUp, quickTransition, smoothTransition } from "@/lib/motion";
import { uniqueNormalizedColors, uniqueNormalizedSizes } from "@/lib/variants";
import { getApiErrorMessage } from "@/services/api";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import type {
  Category,
  PaginationMeta,
  Product,
  ProductFilters as ProductFiltersType,
} from "@/types/product";

type ProductSortOption =
  | "recent"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "promo";

type ProductViewFilters = {
  featuredOnly: boolean;
  newOnly: boolean;
  sort: ProductSortOption;
};

const initialMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

const initialViewFilters: ProductViewFilters = {
  featuredOnly: false,
  newOnly: false,
  sort: "recent",
};

const fieldClass =
  "h-9 w-full rounded-md border border-luxury-beige bg-white px-2.5 text-xs text-luxury-black outline-none transition placeholder:text-luxury-text/65 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/15";

function deriveCategories(products: Product[]) {
  const map = new Map<string, Category>();

  for (const product of products) {
    if (product.category) {
      map.set(product.category.slug, product.category);
    }
  }

  return Array.from(map.values());
}

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  return typeof value === "number" ? value : Number(value);
}

function discountValue(product: Product) {
  const price = toNumber(product.price);
  const oldPrice = toNumber(product.oldPrice);

  if (!price || !oldPrice || oldPrice <= price) {
    return 0;
  }

  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function isNewProduct(product: Product) {
  if (!product.createdAt) {
    return false;
  }

  return Date.now() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 30;
}

function sortProducts(products: Product[], sort: ProductSortOption) {
  return [...products].sort((first, second) => {
    if (sort === "price-asc") {
      return toNumber(first.price) - toNumber(second.price);
    }

    if (sort === "price-desc") {
      return toNumber(second.price) - toNumber(first.price);
    }

    if (sort === "rating-desc") {
      return toNumber(second.averageRating) - toNumber(first.averageRating);
    }

    if (sort === "promo") {
      return discountValue(second) - discountValue(first);
    }

    return (
      new Date(second.createdAt ?? 0).getTime() -
      new Date(first.createdAt ?? 0).getTime()
    );
  });
}

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ProductFiltersType>({
    page: 1,
    limit: 20,
  });
  const [viewFilters, setViewFilters] =
    useState<ProductViewFilters>(initialViewFilters);
  const [meta, setMeta] = useState(initialMeta);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    categoryService
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError("");

    productService
      .getProducts(filters)
      .then((response) => {
        setProducts(response.data);
        setMeta(response.meta);
        setCategories((current) =>
          current.length > 0 ? current : deriveCategories(response.data),
        );
      })
      .catch((loadError) => {
        setError(getApiErrorMessage(loadError));
        setProducts([]);
        setMeta(initialMeta);
      })
      .finally(() => setIsLoading(false));
  }, [filters]);

  useEffect(() => {
    if (!isFilterOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  const sizes = useMemo(
    () =>
      uniqueNormalizedSizes(
        products.flatMap((product) => product.variants.map((variant) => variant.size)),
      ),
    [products],
  );
  const colors = useMemo(
    () =>
      uniqueNormalizedColors(
        products.flatMap((product) => product.variants.map((variant) => variant.color)),
      ),
    [products],
  );

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (viewFilters.featuredOnly && !product.isFeatured) {
        return false;
      }

      if (viewFilters.newOnly && !isNewProduct(product)) {
        return false;
      }

      return true;
    });

    return sortProducts(filtered, viewFilters.sort);
  }, [products, viewFilters]);

  const activeFiltersCount = [
    filters.category,
    filters.size,
    filters.color,
    filters.minPrice,
    filters.maxPrice,
    filters.search,
    viewFilters.featuredOnly,
    viewFilters.newOnly,
    viewFilters.sort !== "recent",
  ].filter(Boolean).length;

  function updateFilter<Key extends keyof ProductFiltersType>(
    key: Key,
    value: ProductFiltersType[Key],
  ) {
    setFilters((current) => ({
      ...current,
      page: 1,
      [key]: value || undefined,
    }));
  }

  function updatePriceFilter(key: "minPrice" | "maxPrice", value: string) {
    setFilters((current) => ({
      ...current,
      page: 1,
      [key]: value ? Number(value) : undefined,
    }));
  }

  function resetFilters() {
    setFilters({ page: 1, limit: 20 });
    setViewFilters(initialViewFilters);
  }

  const filterProps = {
    activeFiltersCount,
    categories,
    colors,
    filters,
    onPriceChange: updatePriceFilter,
    onReset: resetFilters,
    onUpdateFilter: updateFilter,
    onUpdateViewFilters: setViewFilters,
    sizes,
    viewFilters,
  };

  return (
    <main className="section-surface px-3 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">

        <ShopFilterBar
          {...filterProps}
          meta={meta}
          onOpenMobileFilters={() => setIsFilterOpen(true)}
          visibleCount={visibleProducts.length}
        />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="shop-loading"
              transition={smoothTransition}
            >
              <ProductGridSkeleton count={20} />
            </motion.div>
          ) : error ? (
            <motion.div
              animate="visible"
              exit="hidden"
              initial="hidden"
              key="shop-error"
              transition={smoothTransition}
              variants={fadeUp}
            >
              <Card>
                <CardContent className="p-5 text-sm text-luxury-text">
                  {error}
                </CardContent>
              </Card>
            </motion.div>
          ) : visibleProducts.length === 0 ? (
            <EmptyProductsState onReset={resetFilters} />
          ) : (
            <motion.div
              animate="visible"
              exit="hidden"
              initial="hidden"
              key={`shop-data-${meta.page}-${visibleProducts.length}`}
              transition={smoothTransition}
              variants={fadeUp}
            >
              <ProductGrid products={visibleProducts} />
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && !error && visibleProducts.length > 0 ? (
          <ShopPagination
            meta={meta}
            onPageChange={(page) =>
              setFilters((current) => ({
                ...current,
                page,
              }))
            }
          />
        ) : null}
      </div>

      <MobileFilterDrawer
        {...filterProps}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </main>
  );
}



type FilterSharedProps = {
  activeFiltersCount?: number;
  categories: Category[];
  colors: string[];
  filters: ProductFiltersType;
  onPriceChange: (key: "minPrice" | "maxPrice", value: string) => void;
  onReset: () => void;
  onUpdateFilter: <Key extends keyof ProductFiltersType>(
    key: Key,
    value: ProductFiltersType[Key],
  ) => void;
  onUpdateViewFilters: Dispatch<SetStateAction<ProductViewFilters>>;
  sizes: string[];
  viewFilters: ProductViewFilters;
};

type ShopFilterBarProps = FilterSharedProps & {
  meta: PaginationMeta;
  onOpenMobileFilters: () => void;
  visibleCount: number;
};

function ShopFilterBar({
  activeFiltersCount = 0,
  meta,
  onOpenMobileFilters,
  visibleCount,
  ...filterProps
}: ShopFilterBarProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <div className="sticky top-16 z-30 mb-3 rounded-md border border-luxury-beige bg-luxury-ivory/95 p-2.5 shadow-luxury-soft backdrop-blur">
      <div className="grid gap-2 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-end">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-luxury-black">
              {visibleCount} produits
            </p>
            <p className="text-xs text-luxury-text">
              {meta.total} total - page {meta.page}/{Math.max(meta.totalPages, 1)}
            </p>
          </div>
          <Button
            className="h-9 px-3 lg:hidden"
            onClick={onOpenMobileFilters}
            size="sm"
            variant="black"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
          </Button>
        </div>
        <div className="hidden min-w-0 flex-1 lg:block">
          <PrimaryFilterControls
            {...filterProps}
            activeFiltersCount={activeFiltersCount}
            onToggleAdvanced={() =>
              setShowAdvancedFilters((current) => !current)
            }
            showAdvancedFilters={showAdvancedFilters}
          />
        </div>
      </div>

      <AnimatePresence>
        {showAdvancedFilters ? (
          <motion.div
            animate={{ opacity: 1, height: "auto", y: 0 }}
            className="hidden overflow-hidden lg:block"
            exit={{ opacity: 0, height: 0, y: -4 }}
            initial={{ opacity: 0, height: 0, y: -4 }}
            transition={quickTransition}
          >
            <div className="mt-2 border-t border-luxury-beige pt-2">
              <AdvancedFilterControls {...filterProps} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function PrimaryFilterControls({
  activeFiltersCount = 0,
  categories,
  filters,
  onReset,
  onToggleAdvanced,
  onUpdateFilter,
  onUpdateViewFilters,
  showAdvancedFilters,
  viewFilters,
}: FilterSharedProps & {
  onToggleAdvanced: () => void;
  showAdvancedFilters: boolean;
}) {
  return (
    <div className="grid gap-2 lg:grid-cols-[minmax(260px,1fr)_150px_150px_auto_auto] lg:items-end">
      <FilterField label="Recherche">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-luxury-text"
            size={14}
          />
          <input
            className={`${fieldClass} pl-8`}
            onChange={(event) => onUpdateFilter("search", event.target.value)}
            placeholder="Robe, veste..."
            value={filters.search ?? ""}
          />
        </div>
      </FilterField>

      <FilterField label="Categorie">
        <select
          className={fieldClass}
          onChange={(event) => onUpdateFilter("category", event.target.value)}
          value={filters.category ?? ""}
        >
          <option value="">Toutes</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Tri">
        <SortSelect
          onChange={(sort) =>
            onUpdateViewFilters((current) => ({
              ...current,
              sort,
            }))
          }
          value={viewFilters.sort}
        />
      </FilterField>

      <Button
        className="h-9 px-3 text-xs"
        onClick={onToggleAdvanced}
        size="sm"
        variant={showAdvancedFilters ? "black" : "soft"}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtres {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
      </Button>

      <Button
        aria-label="Reinitialiser les filtres"
        className="h-9 w-9 shrink-0"
        onClick={onReset}
        size="icon"
        variant="soft"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}

function AdvancedFilterControls({
  colors,
  filters,
  onPriceChange,
  onUpdateFilter,
  onUpdateViewFilters,
  sizes,
  viewFilters,
}: FilterSharedProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[110px_130px_95px_95px_auto] lg:items-end">
      <FilterField label="Taille">
        <select
          className={fieldClass}
          onChange={(event) => onUpdateFilter("size", event.target.value)}
          value={filters.size ?? ""}
        >
          <option value="">Toutes</option>
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Couleur">
        <select
          className={fieldClass}
          onChange={(event) => onUpdateFilter("color", event.target.value)}
          value={filters.color ?? ""}
        >
          <option value="">Toutes</option>
          {colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Min">
        <input
          className={fieldClass}
          min={0}
          onChange={(event) => onPriceChange("minPrice", event.target.value)}
          placeholder="0"
          type="number"
          value={filters.minPrice ?? ""}
        />
      </FilterField>

      <FilterField label="Max">
        <input
          className={fieldClass}
          min={0}
          onChange={(event) => onPriceChange("maxPrice", event.target.value)}
          placeholder="2500"
          type="number"
          value={filters.maxPrice ?? ""}
        />
      </FilterField>

      <div className="flex items-end gap-1.5 sm:col-span-2 lg:col-span-1">
        <button
          className={`h-9 rounded-md border px-2.5 text-xs font-semibold transition ${
            viewFilters.featuredOnly
              ? "border-luxury-gold bg-luxury-gold text-luxury-black"
              : "border-luxury-beige bg-white text-luxury-text hover:border-luxury-gold"
          }`}
          onClick={() =>
            onUpdateViewFilters((current) => ({
              ...current,
              featuredOnly: !current.featuredOnly,
            }))
          }
          type="button"
        >
          Featured
        </button>
        <button
          className={`h-9 rounded-md border px-2.5 text-xs font-semibold transition ${
            viewFilters.newOnly
              ? "border-luxury-gold bg-luxury-gold text-luxury-black"
              : "border-luxury-beige bg-white text-luxury-text hover:border-luxury-gold"
          }`}
          onClick={() =>
            onUpdateViewFilters((current) => ({
              ...current,
              newOnly: !current.newOnly,
            }))
          }
          type="button"
        >
          New
        </button>
      </div>
    </div>
  );
}

function DrawerFilterControls(props: FilterSharedProps) {
  const {
    categories,
    filters,
    onReset,
    onUpdateFilter,
    onUpdateViewFilters,
    viewFilters,
  } = props;

  return (
    <div className="grid gap-3">
      <FilterField label="Recherche">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-luxury-text"
            size={14}
          />
          <input
            className={`${fieldClass} pl-8`}
            onChange={(event) => onUpdateFilter("search", event.target.value)}
            placeholder="Robe, veste..."
            value={filters.search ?? ""}
          />
        </div>
      </FilterField>

      <FilterField label="Categorie">
        <select
          className={fieldClass}
          onChange={(event) => onUpdateFilter("category", event.target.value)}
          value={filters.category ?? ""}
        >
          <option value="">Toutes</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label="Tri">
        <SortSelect
          onChange={(sort) =>
            onUpdateViewFilters((current) => ({
              ...current,
              sort,
            }))
          }
          value={viewFilters.sort}
        />
      </FilterField>

      <AdvancedFilterControls {...props} />

      <Button className="w-full" onClick={onReset} variant="soft">
        <RotateCcw className="h-4 w-4" />
        Reinitialiser
      </Button>
    </div>
  );
}

function SortSelect({
  onChange,
  value,
}: {
  onChange: (value: ProductSortOption) => void;
  value: ProductSortOption;
}) {
  return (
    <select
      className={fieldClass}
      onChange={(event) => onChange(event.target.value as ProductSortOption)}
      value={value}
    >
      <option value="recent">Nouveautes</option>
      <option value="price-asc">Prix + bas</option>
      <option value="price-desc">Prix + haut</option>
      <option value="rating-desc">Mieux notes</option>
      <option value="promo">Promotions</option>
    </select>
  );
}

function MobileFilterDrawer({
  isOpen,
  onClose,
  ...filterProps
}: FilterSharedProps & {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            aria-label="Fermer les filtres"
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-luxury-black/70 backdrop-blur-sm lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            transition={quickTransition}
            type="button"
          />
          <motion.aside
            animate={{ y: 0 }}
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[86dvh] overflow-hidden rounded-t-2xl border border-luxury-beige bg-luxury-ivory shadow-luxury lg:hidden"
            exit={{ y: "100%" }}
            initial={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-luxury-beige px-4 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-luxury-gold">
                  Boutique
                </p>
                <h2 className="font-heading text-2xl font-semibold">Filtres</h2>
              </div>
              <Button aria-label="Fermer" onClick={onClose} size="icon" variant="ghost">
                <X size={18} />
              </Button>
            </div>
            <div className="max-h-[62dvh] overflow-y-auto px-4 py-4">
              <DrawerFilterControls {...filterProps} />
            </div>
            <div className="border-t border-luxury-beige p-4">
              <Button className="w-full" onClick={onClose}>
                Voir les resultats
              </Button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function ShopPagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2 rounded-md border border-luxury-beige bg-white/90 p-2 shadow-luxury-soft">
      <Button
        className="h-9 px-3 text-xs"
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
        size="sm"
        variant="soft"
      >
        Precedent
      </Button>
      <span className="rounded-full bg-luxury-black px-3 py-1 text-xs font-semibold text-luxury-ivory">
        {meta.page}/{Math.max(meta.totalPages, 1)}
      </span>
      <Button
        className="h-9 px-3 text-xs"
        disabled={meta.page >= meta.totalPages}
        onClick={() => onPageChange(meta.page + 1)}
        size="sm"
        variant="black"
      >
        Suivant
      </Button>
    </div>
  );
}

function EmptyProductsState({ onReset }: { onReset: () => void }) {
  return (
    <Card>
      <CardContent className="p-5">
        <EmptyState
          action={
            <Button onClick={onReset} variant="black">
              Reinitialiser les filtres
            </Button>
          }
          description="Essayez une autre categorie, une autre taille ou retirez le prix maximum."
          title="Aucun produit trouve"
        />
      </CardContent>
    </Card>
  );
}

function FilterField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block text-[10px] font-semibold uppercase tracking-[0.04em] text-luxury-text">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function HeaderPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-luxury-ivory/10 bg-white/[0.04] px-2">
      <span className="text-luxury-gold">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
