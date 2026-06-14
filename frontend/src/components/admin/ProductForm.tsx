"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { ProductFormPayload } from "@/types/admin";
import type { Category, Product } from "@/types/product";

type ProductFormProps = {
  categories: Category[];
  formId?: string;
  hideActions?: boolean;
  initialProduct?: Product;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (payload: ProductFormPayload) => Promise<void>;
};

type ProductImageForm = {
  url: string;
  alt: string;
};

type ProductVariantForm = {
  size: string;
  color: string;
  stock: string;
  sku: string;
};

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  oldPrice: string;
  categoryId: string;
  isFeatured: boolean;
  isActive: boolean;
  images: ProductImageForm[];
  variants: ProductVariantForm[];
};

type FormErrors = Partial<
  Record<
    | "name"
    | "description"
    | "price"
    | "oldPrice"
    | "categoryId"
    | "images"
    | "variants",
    string
  >
>;

function buildInitialState(product?: Product): ProductFormState {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ? String(product.price) : "",
    oldPrice: product?.oldPrice ? String(product.oldPrice) : "",
    categoryId: product?.categoryId ?? "",
    isFeatured: product?.isFeatured ?? false,
    isActive: product?.isActive ?? true,
    images:
      product?.images.length
        ? [...product.images]
            .sort((first, second) => first.position - second.position)
            .map((image) => ({ url: image.url, alt: image.alt ?? product.name }))
        : [{ url: "", alt: "" }],
    variants:
      product?.variants.length
        ? product.variants.map((variant) => ({
            size: variant.size,
            color: variant.color,
            stock: String(variant.stock),
            sku: variant.sku,
          }))
        : [{ size: "", color: "", stock: "0", sku: "" }],
  };
}

function isValidImageUrl(value: string) {
  if (!value.trim()) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeSize(value: string) {
  return value.replace(/\s+/g, " ").trim().toUpperCase();
}

function normalizeColor(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ProductForm({
  categories,
  formId,
  hideActions,
  initialProduct,
  isSubmitting,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormState>(() =>
    buildInitialState(initialProduct),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const validImages = useMemo(
    () =>
      form.images
        .map((image, index) => ({
          url: image.url.trim(),
          alt: image.alt.trim() || form.name.trim(),
          position: index,
        }))
        .filter((image) => image.url),
    [form.images, form.name],
  );

  const validVariants = useMemo(
    () =>
      form.variants
        .map((variant) => ({
          size: normalizeSize(variant.size),
          color: normalizeColor(variant.color),
          stock: Number(variant.stock),
          sku: variant.sku.trim(),
        }))
        .filter((variant) => variant.size || variant.color || variant.sku),
    [form.variants],
  );

  function setField<Key extends keyof ProductFormState>(
    key: Key,
    value: ProductFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateImage(index: number, key: keyof ProductImageForm, value: string) {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) =>
        imageIndex === index ? { ...image, [key]: value } : image,
      ),
    }));
  }

  function addImage() {
    setForm((current) => ({
      ...current,
      images: [...current.images, { url: "", alt: "" }],
    }));
  }

  function removeImage(index: number) {
    setForm((current) => ({
      ...current,
      images:
        current.images.length === 1
          ? [{ url: "", alt: "" }]
          : current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  }

  function updateVariant(
    index: number,
    key: keyof ProductVariantForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [key]: value } : variant,
      ),
    }));
  }

  function addVariant() {
    setForm((current) => ({
      ...current,
      variants: [...current.variants, { size: "", color: "", stock: "0", sku: "" }],
    }));
  }

  function removeVariant(index: number) {
    setForm((current) => ({
      ...current,
      variants:
        current.variants.length === 1
          ? [{ size: "", color: "", stock: "0", sku: "" }]
          : current.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  }

  function validate() {
    const nextErrors: FormErrors = {};
    const price = Number(form.price);
    const oldPrice = form.oldPrice ? Number(form.oldPrice) : undefined;
    const skuValues = validVariants
      .map((variant) => variant.sku.toLowerCase())
      .filter(Boolean);
    const variantKeys = validVariants.map(
      (variant) => `${variant.size}:${variant.color}`.toLowerCase(),
    );

    if (!form.name.trim()) {
      nextErrors.name = "Le nom du produit est obligatoire.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "La description est obligatoire.";
    }

    if (!form.categoryId) {
      nextErrors.categoryId = "Selectionnez une categorie.";
    }

    if (!Number.isFinite(price) || price <= 0) {
      nextErrors.price = "Le prix doit etre superieur a 0.";
    }

    if (oldPrice !== undefined && (!Number.isFinite(oldPrice) || oldPrice <= 0)) {
      nextErrors.oldPrice = "L'ancien prix doit etre superieur a 0.";
    }

    if (validImages.length === 0) {
      nextErrors.images = "Ajoutez au moins une image.";
    } else if (validImages.some((image) => !isValidImageUrl(image.url))) {
      nextErrors.images = "Chaque image doit etre une URL http(s) valide.";
    }

    if (validVariants.length === 0) {
      nextErrors.variants = "Ajoutez au moins une variante.";
    } else if (
      validVariants.some(
        (variant) =>
          !variant.size ||
          !variant.color ||
          !Number.isFinite(variant.stock) ||
          variant.stock < 0,
      )
    ) {
      nextErrors.variants =
        "Chaque variante doit avoir taille, couleur et stock positif ou nul.";
    } else if (new Set(variantKeys).size !== variantKeys.length) {
      nextErrors.variants =
        "Deux variantes ont la meme taille et couleur apres normalisation.";
    } else if (new Set(skuValues).size !== skuValues.length) {
      nextErrors.variants = "Les SKU doivent etre uniques.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
      categoryId: form.categoryId,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      images: validImages,
      variants: validVariants,
    });
  }

  return (
    <Card>
      <CardContent className="p-0">
        <form className="grid gap-0" id={formId} onSubmit={handleSubmit}>
          <FormSection
            description="Les informations principales visibles sur la boutique."
            title="Informations produit"
          >
            <Input
              error={errors.name}
              label="Nom"
              onChange={(event) => setField("name", event.target.value)}
              placeholder="Robe satin signature"
              value={form.name}
            />
            <label className="block text-sm text-luxury-black">
              <span className="mb-2 block font-medium text-luxury-black">
                Description
              </span>
              <textarea
                className={cn(
                  "min-h-36 w-full rounded-md border border-luxury-beige bg-white px-4 py-3 text-luxury-black shadow-[0_10px_30px_rgba(11,11,11,0.035)] outline-none transition",
                  "placeholder:text-luxury-text/70 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20",
                  errors.description &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500/15",
                )}
                onChange={(event) => setField("description", event.target.value)}
                placeholder="Description courte, matiere, coupe et style..."
                value={form.description}
              />
              {errors.description ? (
                <span className="mt-2 block text-xs text-red-600">
                  {errors.description}
                </span>
              ) : null}
            </label>
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                error={errors.price}
                label="Prix"
                min="0.01"
                onChange={(event) => setField("price", event.target.value)}
                step="0.01"
                type="number"
                value={form.price}
              />
              <Input
                error={errors.oldPrice}
                label="Ancien prix"
                min="0.01"
                onChange={(event) => setField("oldPrice", event.target.value)}
                step="0.01"
                type="number"
                value={form.oldPrice}
              />
            </div>
            <label className="block text-sm text-luxury-black">
              <span className="mb-2 block font-medium">Categorie</span>
              <select
                className={cn(
                  "h-12 w-full rounded-md border border-luxury-beige bg-white px-4 outline-none focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20",
                  errors.categoryId &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500/15",
                )}
                onChange={(event) => setField("categoryId", event.target.value)}
                value={form.categoryId}
              >
                <option value="">Selectionner une categorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId ? (
                <span className="mt-2 block text-xs text-red-600">
                  {errors.categoryId}
                </span>
              ) : null}
            </label>
          </FormSection>

          <FormSection
            
              description="Ajoutez des images de haute qualité pour mettre en valeur votre produit."
              title="Images produit"
          >
            {errors.images ? <FormError message={errors.images} /> : null}
            <div className="grid gap-4">
              {form.images.map((image, index) => (
                <div
                  className="grid gap-4 rounded-md border border-luxury-beige bg-luxury-ivory/45 p-3 sm:p-4 lg:grid-cols-[120px_minmax(0,1fr)_auto]"
                  key={index}
                >
                  <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-md bg-luxury-black text-sm text-luxury-gold sm:h-32 lg:h-28 lg:w-28">
                    {isValidImageUrl(image.url) ? (
                      <img
                        alt={image.alt || form.name || "Produit"}
                        className="h-full w-full object-cover"
                        src={image.url}
                      />
                    ) : (
                      "Apercu"
                    )}
                  </div>
                  <div className="grid gap-3">
                    <Input
                      label={`Image ${index + 1}`}
                      onChange={(event) => updateImage(index, "url", event.target.value)}
                      placeholder="https://..."
                      type="url"
                      value={image.url}
                    />
                    <Input
                      label="Texte alternatif"
                      onChange={(event) => updateImage(index, "alt", event.target.value)}
                      placeholder={form.name || "Yakout Luxury"}
                      value={image.alt}
                    />
                  </div>
                  <Button
                    aria-label="Supprimer image"
                    className="w-full self-end sm:w-auto"
                    onClick={() => removeImage(index)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
            </div>
            
              <Button onClick={addImage} size="sm" type="button" variant="soft">
                <Plus size={16} />
                Ajouter image
              </Button>
            
          </FormSection>

          <FormSection
            action={
              <Button onClick={addVariant} size="sm" type="button" variant="soft">
                <Plus size={16} />
                Ajouter variante
              </Button>
            }
            description="Chaque combinaison taille/couleur doit avoir son stock. Le SKU est genere automatiquement si vous le laissez vide."
            title="Variantes et stock"
          >
            {errors.variants ? <FormError message={errors.variants} /> : null}
            <div className="grid gap-4">
              {form.variants.map((variant, index) => (
                <div
                  className="grid gap-4 rounded-md border border-luxury-beige bg-white p-3 sm:p-4 xl:grid-cols-[1fr_1fr_140px_1fr_auto]"
                  key={index}
                >
                  <Input
                    label="Taille"
                    onChange={(event) => updateVariant(index, "size", event.target.value)}
                    placeholder="S, M, L"
                    value={variant.size}
                  />
                  <Input
                    label="Couleur"
                    onChange={(event) => updateVariant(index, "color", event.target.value)}
                    placeholder="Noir"
                    value={variant.color}
                  />
                  <Input
                    label="Stock"
                    min="0"
                    onChange={(event) => updateVariant(index, "stock", event.target.value)}
                    type="number"
                    value={variant.stock}
                  />
                  <Input
                    label="SKU"
                    onChange={(event) => updateVariant(index, "sku", event.target.value)}
                    placeholder="Auto si vide"
                    value={variant.sku}
                  />
                  <Button
                    aria-label="Supprimer variante"
                    className="w-full self-end sm:w-auto"
                    onClick={() => removeVariant(index)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection
            description="Controlez la mise en avant et la visibilite du produit."
            title="Publication"
          >
            <div className="flex flex-wrap gap-3">
              <TogglePill
                checked={form.isFeatured}
                label="Produit signature"
                onChange={(checked) => setField("isFeatured", checked)}
              />
              <TogglePill
                checked={form.isActive}
                label="Actif dans la boutique"
                onChange={(checked) => setField("isActive", checked)}
              />
            </div>
            <div className="flex flex-col gap-3 border-t border-luxury-beige pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge variant="light">{validImages.length} image(s)</Badge>
                <Badge variant="light">{validVariants.length} variante(s)</Badge>
              </div>
              {!hideActions ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                {onCancel ? (
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                    onClick={onCancel}
                    type="button"
                    variant="soft"
                  >
                    Annuler
                  </Button>
                ) : null}
                <Button className="w-full sm:w-auto" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Enregistrement..." : "Enregistrer le produit"}
                </Button>
              </div>
              ) : null}
            </div>
          </FormSection>
        </form>
      </CardContent>
    </Card>
  );
}

function FormSection({
  action,
  children,
  description,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="border-b border-luxury-beige p-4 last:border-b-0 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-luxury-text">
            {description}
          </p>
        </div>
        {action}
      </div>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

function TogglePill({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition",
        checked
          ? "border-luxury-gold bg-luxury-gold/15 text-luxury-black"
          : "border-luxury-beige bg-white text-luxury-text",
      )}
    >
      <input
        checked={checked}
        className="h-4 w-4 accent-luxury-gold"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {label}
    </label>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}
