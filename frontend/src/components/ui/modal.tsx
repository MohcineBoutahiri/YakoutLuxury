"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type ModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  className?: string;
};

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  footer,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-black/75 px-5 py-8 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-lg rounded-md border border-luxury-beige bg-luxury-ivory shadow-luxury",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between gap-4 border-b border-luxury-beige px-6 py-5">
          <h2 id="modal-title" className="font-heading text-2xl font-semibold">
            {title}
          </h2>
          <Button aria-label="Fermer" onClick={onClose} size="sm" variant="ghost">
            Fermer
          </Button>
        </div>
        <div className="px-6 py-6 text-luxury-text">{children}</div>
        {footer ? (
          <div className="border-t border-luxury-beige px-6 py-5">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
