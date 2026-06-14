"use client";

import type { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, ProductFilters as ProductFiltersType } from "@/types/product";

export type ProductSortOption = "recent" | "price-asc" | "price-desc";

export type ProductViewFilters = {
  featuredOnly: boolean;
  newOnly: boolean;
  sort: ProductSortOption;
};

type ProductFiltersProps = {
  categories: Category[];
  filters: ProductFiltersType;
  sizes: string[];
  colors: string[];
  onChange: (filters: ProductFiltersType) => void;
  onReset: () => void;
  viewFilters?: ProductViewFilters;
  onViewChange?: (filters: ProductViewFilters) => void;
  showAdvanced?: boolean;
};

export function ProductFilters({
  categories,
  colors,
  filters,
  onChange,
  onReset,
  onViewChange,
  showAdvanced = false,
  sizes,
  viewFilters,
}: ProductFiltersProps) {
  function updateFilter(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;

    onChange({
      ...filters,
      page: 1,
      [name]:
        name === "minPrice" || name === "maxPrice"
          ? value
            ? Number(value)
            : undefined
          : value || undefined,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange({ ...filters, page: 1 });
  }

  function updateViewFilter(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    if (!viewFilters || !onViewChange) {
      return;
    }

    const target = event.target;

    if (target.name === "sort") {
      onViewChange({
        ...viewFilters,
        sort: target.value as ProductSortOption,
      });
      return;
    }

    if (target.name === "featuredOnly") {
      onViewChange({
        ...viewFilters,
        featuredOnly: (target as HTMLInputElement).checked,
      });
      return;
    }

    if (target.name === "newOnly") {
      onViewChange({
        ...viewFilters,
        newOnly: (target as HTMLInputElement).checked,
      });
    }
  }

  function handleReset() {
    onReset();

    if (viewFilters && onViewChange) {
      onViewChange({
        featuredOnly: false,
        newOnly: false,
        sort: "recent",
      });
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div>
        <p className="font-heading text-2xl font-semibold">Filtres</p>
        <p className="mt-2 text-sm leading-6 text-luxury-text">
          Affinez la collection par style, taille, couleur et budget.
        </p>
      </div>
      <Input
        label="Recherche"
        name="search"
        onChange={updateFilter}
        placeholder="Robe, veste, accessoire..."
        value={filters.search ?? ""}
      />

      <label className="block text-sm text-luxury-black">
        <span className="mb-2 block font-medium">Categorie</span>
        <select
          className="h-12 w-full rounded-md border border-luxury-beige bg-white px-4 outline-none transition focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20"
          name="category"
          onChange={updateFilter}
          value={filters.category ?? ""}
        >
          <option value="">Toutes</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <label className="block text-sm text-luxury-black">
          <span className="mb-2 block font-medium">Taille</span>
          <select
            className="h-12 w-full rounded-md border border-luxury-beige bg-white px-4 outline-none transition focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20"
            name="size"
            onChange={updateFilter}
            value={filters.size ?? ""}
          >
            <option value="">Toutes</option>
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-luxury-black">
          <span className="mb-2 block font-medium">Couleur</span>
          <select
            className="h-12 w-full rounded-md border border-luxury-beige bg-white px-4 outline-none transition focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20"
            name="color"
            onChange={updateFilter}
            value={filters.color ?? ""}
          >
            <option value="">Toutes</option>
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <Input
          label="Prix min"
          min={0}
          name="minPrice"
          onChange={updateFilter}
          type="number"
          value={filters.minPrice ?? ""}
        />
        <Input
          label="Prix max"
          min={0}
          name="maxPrice"
          onChange={updateFilter}
          type="number"
          value={filters.maxPrice ?? ""}
        />
      </div>

      {showAdvanced && viewFilters ? (
        <div className="grid gap-4 border-y border-luxury-beige py-5">
          <label className="block text-sm text-luxury-black">
            <span className="mb-2 block font-medium">Tri</span>
            <select
              className="h-12 w-full rounded-md border border-luxury-beige bg-white px-4 outline-none transition focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20"
              name="sort"
              onChange={updateViewFilter}
              value={viewFilters.sort}
            >
              <option value="recent">Plus recent</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix decroissant</option>
            </select>
          </label>

          <label className="flex items-center justify-between gap-4 rounded-md border border-luxury-beige bg-white px-4 py-3 text-sm text-luxury-black">
            <span>Featured uniquement</span>
            <input
              checked={viewFilters.featuredOnly}
              className="h-4 w-4 accent-luxury-gold"
              name="featuredOnly"
              onChange={updateViewFilter}
              type="checkbox"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-md border border-luxury-beige bg-white px-4 py-3 text-sm text-luxury-black">
            <span>Nouveautes uniquement</span>
            <input
              checked={viewFilters.newOnly}
              className="h-4 w-4 accent-luxury-gold"
              name="newOnly"
              onChange={updateViewFilter}
              type="checkbox"
            />
          </label>
        </div>
      ) : null}

      
    </form>
  );
}
