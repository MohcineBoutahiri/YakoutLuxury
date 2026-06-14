"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  cancelLabel = "Annuler",
  confirmLabel = "Confirmer",
  description,
  isLoading,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-luxury-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-md border border-luxury-beige bg-white p-5 shadow-luxury">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-700">
            <AlertTriangle size={20} />
          </span>
          <div>
            <h2 className="font-heading text-2xl font-semibold text-luxury-black">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-luxury-text">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button disabled={isLoading} onClick={onCancel} variant="soft">
            {cancelLabel}
          </Button>
          <Button disabled={isLoading} onClick={onConfirm} variant="dark">
            {isLoading ? "Traitement..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
