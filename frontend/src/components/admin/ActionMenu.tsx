"use client";

import { useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";

export type ActionMenuItem = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  danger?: boolean;
  disabled?: boolean;
};

export function ActionMenu({ items }: { items: ActionMenuItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        aria-label="Actions"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-luxury-beige bg-white text-luxury-black transition hover:border-luxury-gold hover:bg-luxury-ivory"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <MoreHorizontal size={18} />
      </button>
      {open ? (
        <>
          <button
            aria-label="Fermer le menu actions"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-md border border-luxury-beige bg-white py-2 text-sm shadow-luxury">
            {items.map((item) => {
              const content = (
                <>
                  {item.icon}
                  <span>{item.label}</span>
                </>
              );
              const className = cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-luxury-ivory",
                item.danger ? "text-red-700" : "text-luxury-black",
                item.disabled && "pointer-events-none opacity-50",
              );

              if (item.href) {
                return (
                  <a
                    className={className}
                    href={item.href}
                    key={item.label}
                    onClick={() => setOpen(false)}
                    target={item.target}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <button
                  className={className}
                  disabled={item.disabled}
                  key={item.label}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  type="button"
                >
                  {content}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
