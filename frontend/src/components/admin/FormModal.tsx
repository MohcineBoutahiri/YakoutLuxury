"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type FormModalProps = {
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  size?: "md" | "lg" | "xl" | "fullscreen";
  title: string;
};

const sizeClasses = {
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  fullscreen: "max-w-6xl",
};

export function FormModal({
  children,
  description,
  footer,
  onClose,
  open,
  size = "lg",
  title,
}: FormModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center overflow-hidden bg-luxury-black/70 px-3 py-4 backdrop-blur-sm sm:px-5">
      <div
        aria-modal="true"
        className={cn(
          "flex max-h-[92vh] w-full flex-col overflow-hidden rounded-md border border-luxury-beige bg-white shadow-luxury",
          sizeClasses[size],
        )}
        role="dialog"
      >
        <header className="shrink-0 border-b border-luxury-beige bg-luxury-ivory/75 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-heading text-2xl font-semibold text-luxury-black sm:text-3xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-luxury-text">{description}</p>
            ) : null}
          </div>
          <Button aria-label="Fermer" onClick={onClose} size="icon" variant="ghost">
            <X size={18} />
          </Button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto bg-white p-4 sm:p-6">
          {children}
        </main>
        {footer ? (
          <footer className="shrink-0 border-t border-luxury-beige bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              {footer}
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
