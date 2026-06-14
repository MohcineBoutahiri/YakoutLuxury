"use client";

import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function SearchInput({ className, label, ...props }: SearchInputProps) {
  return (
    <label className="block text-sm text-luxury-black">
      {label ? <span className="mb-2 block font-medium">{label}</span> : null}
      <span className="relative block">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-luxury-text"
          size={17}
        />
        <input
          className={cn(
            "h-12 w-full rounded-md border border-luxury-beige bg-white pl-11 pr-4 text-luxury-black outline-none transition placeholder:text-luxury-text/70 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20",
            className,
          )}
          {...props}
        />
      </span>
    </label>
  );
}
