"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { useState } from "react";
import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type AdminFilterBarProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminFilterBar({ actions, children, className }: AdminFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mb-4 rounded-md border border-luxury-beige/80 bg-white px-3 py-3 shadow-[0_10px_28px_rgba(11,11,11,0.045)]">
      <button
        className="flex w-full items-center justify-between text-sm font-medium text-luxury-black md:hidden"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Filtres
        </span>
        <ChevronDown
          className={cn("transition", isOpen && "rotate-180")}
          size={16}
        />
      </button>

      <div
        className={cn(
          "mt-3 grid gap-2 md:mt-0 md:grid md:items-end",
          "md:[grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]",
          !isOpen && "hidden md:grid",
          className,
        )}
      >
        {children}
        {actions ? <div className="flex items-end gap-2 md:justify-end">{actions}</div> : null}
      </div>
    </section>
  );
}

type AdminFilterInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function AdminFilterInput({
  className,
  label,
  type = "text",
  ...props
}: AdminFilterInputProps) {
  return (
    <label className="min-w-0 text-xs font-medium text-luxury-text">
      <span className="mb-1 block truncate">{label}</span>
      <input
        className={cn(
          "h-9 w-full rounded-md border border-luxury-beige bg-luxury-ivory/35 px-3 text-sm text-luxury-black outline-none transition",
          "placeholder:text-luxury-text/60 focus:border-luxury-gold focus:bg-white focus:ring-2 focus:ring-luxury-gold/15",
          className,
        )}
        type={type}
        {...props}
      />
    </label>
  );
}

export function AdminFilterDate(props: AdminFilterInputProps) {
  return <AdminFilterInput type="date" {...props} />;
}

type AdminFilterSearchProps = AdminFilterInputProps;

export function AdminFilterSearch({
  className,
  label,
  ...props
}: AdminFilterSearchProps) {
  return (
    <label className="min-w-0 text-xs font-medium text-luxury-text">
      <span className="mb-1 block truncate">{label}</span>
      <span className="relative block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-luxury-text"
          size={15}
        />
        <input
          className={cn(
            "h-9 w-full rounded-md border border-luxury-beige bg-luxury-ivory/35 pl-9 pr-3 text-sm text-luxury-black outline-none transition",
            "placeholder:text-luxury-text/60 focus:border-luxury-gold focus:bg-white focus:ring-2 focus:ring-luxury-gold/15",
            className,
          )}
          {...props}
        />
      </span>
    </label>
  );
}

type AdminFilterSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  onValueChange?: (value: string) => void;
  options: Array<[string, string]>;
};

export function AdminFilterSelect({
  className,
  label,
  onChange,
  onValueChange,
  options,
  ...props
}: AdminFilterSelectProps) {
  return (
    <label className="min-w-0 text-xs font-medium text-luxury-text">
      <span className="mb-1 block truncate">{label}</span>
      <select
        className={cn(
          "h-9 w-full rounded-md border border-luxury-beige bg-luxury-ivory/35 px-3 text-sm text-luxury-black outline-none transition",
          "focus:border-luxury-gold focus:bg-white focus:ring-2 focus:ring-luxury-gold/15",
          className,
        )}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...props}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

type AdminFilterActionsProps = {
  onFilter?: () => void;
  onReset?: () => void;
  filterLabel?: string;
  resetLabel?: string;
};

export function AdminFilterActions({
  filterLabel = "Filtrer",
  onFilter,
  onReset,
  resetLabel = "Reset",
}: AdminFilterActionsProps) {
  return (
    <>
      {onFilter ? (
        <Button className="h-9 px-3 text-xs" onClick={onFilter} size="sm">
          {filterLabel}
        </Button>
      ) : null}
      {onReset ? (
        <Button
          className="h-9 px-3 text-xs"
          onClick={onReset}
          size="sm"
          variant="soft"
        >
          <RotateCcw size={14} />
          {resetLabel}
        </Button>
      ) : null}
    </>
  );
}
