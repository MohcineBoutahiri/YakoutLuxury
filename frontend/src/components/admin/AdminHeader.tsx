"use client";

import { Menu, Search, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type AdminHeaderProps = {
  title: string;
  onOpenMobileMenu?: () => void;
};

export function AdminHeader({ onOpenMobileMenu, title }: AdminHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="mb-4 grid gap-3 lg:grid-cols-[1fr_minmax(220px,320px)_auto] lg:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Ouvrir le menu admin"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-luxury-beige bg-white text-luxury-black transition hover:border-luxury-gold lg:hidden"
          onClick={onOpenMobileMenu}
          type="button"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <p className="premium-eyebrow">Yakout Admin</p>
          <h1 className="truncate font-heading text-2xl font-semibold leading-tight text-luxury-black sm:text-3xl">
            {title}
          </h1>
        </div>
      </div>

      <label className="relative hidden lg:block">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-luxury-text"
          size={17}
        />
        <input
          className="h-10 w-full rounded-md border border-luxury-beige bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-luxury-text/70 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20"
          placeholder="Recherche admin..."
          type="search"
        />
      </label>

      <div className="hidden items-center gap-2 rounded-md border border-luxury-beige bg-white px-3 py-1.5 shadow-luxury-soft lg:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-luxury-black text-luxury-gold">
          <ShieldCheck size={17} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-luxury-black">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="block text-xs uppercase text-luxury-text">Admin</span>
        </span>
      </div>
    </header>
  );
}
