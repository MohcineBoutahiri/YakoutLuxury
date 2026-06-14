"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { CategoryFormPayload } from "@/types/admin";
import type { Category } from "@/types/product";

type CategoryFormProps = {
  formId?: string;
  hideActions?: boolean;
  initialCategory?: Category;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (payload: CategoryFormPayload) => Promise<void>;
};

type CategoryFormState = {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

function buildInitialState(category?: Category): CategoryFormState {
  return {
    name: category?.name ?? "",
    description: category?.description ?? "",
    imageUrl: category?.imageUrl ?? "",
    isActive: category?.isActive ?? true,
  };
}

function isValidUrl(value: string) {
  if (!value.trim()) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function CategoryForm({
  formId,
  hideActions,
  initialCategory,
  isSubmitting,
  onCancel,
  onSubmit,
}: CategoryFormProps) {
  const [form, setForm] = useState<CategoryFormState>(() =>
    buildInitialState(initialCategory),
  );
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormState, string>>>(
    {},
  );

  useEffect(() => {
    setForm(buildInitialState(initialCategory));
    setErrors({});
  }, [initialCategory]);

  function setField<Key extends keyof CategoryFormState>(
    key: Key,
    value: CategoryFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof CategoryFormState, string>> = {};

    if (!form.name.trim()) {
      nextErrors.name = "Le nom de la categorie est obligatoire.";
    }

    if (!isValidUrl(form.imageUrl)) {
      nextErrors.imageUrl = "L'image doit etre une URL http(s) valide.";
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
      description: form.description.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      isActive: form.isActive,
    });

    if (!initialCategory) {
      setForm(buildInitialState());
      setErrors({});
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <form id={formId} onSubmit={handleSubmit}>
          <section className="border-b border-luxury-beige p-4 sm:p-6">
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              {initialCategory ? "Modifier la categorie" : "Nouvelle categorie"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-luxury-text">
              Organisez les collections visibles dans la boutique.
            </p>
            <div className="mt-6 grid gap-5">
              <Input
                error={errors.name}
                label="Nom"
                onChange={(event) => setField("name", event.target.value)}
                placeholder="Robes"
                value={form.name}
              />
              <Input
                error={errors.imageUrl}
                label="Image URL"
                onChange={(event) => setField("imageUrl", event.target.value)}
                placeholder="https://..."
                type="url"
                value={form.imageUrl}
              />
              <div className="overflow-hidden rounded-md border border-luxury-beige bg-luxury-ivory/50">
                <div className="flex h-36 items-center justify-center bg-luxury-black text-sm text-luxury-gold">
                  {isValidUrl(form.imageUrl) && form.imageUrl ? (
                    <img
                      alt={form.name || "Categorie"}
                      className="h-full w-full object-cover"
                      src={form.imageUrl}
                    />
                  ) : (
                    "Apercu image"
                  )}
                </div>
              </div>
              <label className="block text-sm text-luxury-black">
                <span className="mb-2 block font-medium">Description</span>
                <textarea
                  className="min-h-28 w-full rounded-md border border-luxury-beige bg-white px-4 py-3 outline-none transition focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20"
                  onChange={(event) => setField("description", event.target.value)}
                  placeholder="Description courte de la collection..."
                  value={form.description}
                />
              </label>
            </div>
          </section>

          <section className="p-4 sm:p-6">
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium transition",
                form.isActive
                  ? "border-luxury-gold bg-luxury-gold/15 text-luxury-black"
                  : "border-luxury-beige bg-white text-luxury-text",
              )}
            >
              <input
                checked={form.isActive}
                className="h-4 w-4 accent-luxury-gold"
                onChange={(event) => setField("isActive", event.target.checked)}
                type="checkbox"
              />
              Active dans la boutique
            </label>
            {!hideActions ? (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              {onCancel ? (
                <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="soft">
                  Annuler
                </Button>
              ) : null}
              <Button className="sm:w-auto" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Enregistrement..." : "Enregistrer la categorie"}
              </Button>
            </div>
            ) : null}
          </section>
        </form>
      </CardContent>
    </Card>
  );
}
