import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function FormSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="rounded-md border border-luxury-beige bg-white p-4 sm:p-5">
      <div className="mb-5">
        <h3 className="font-heading text-2xl font-semibold text-luxury-black">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-luxury-text">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function FormActions({
  cancelLabel = "Annuler",
  className,
  isSubmitting,
  onCancel,
  submitLabel = "Enregistrer",
}: {
  cancelLabel?: string;
  className?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:justify-end", className)}>
      {onCancel ? (
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="soft">
          {cancelLabel}
        </Button>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Enregistrement..." : submitLabel}
      </Button>
    </div>
  );
}
