import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function Input({
  className,
  label,
  error,
  helperText,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block text-sm text-luxury-black" htmlFor={inputId}>
      {label ? (
        <span className="mb-2 block font-medium text-luxury-black">{label}</span>
      ) : null}
      <input
        className={cn(
          "h-12 w-full rounded-md border border-luxury-beige bg-white px-4 text-luxury-black shadow-[0_10px_30px_rgba(11,11,11,0.035)] outline-none transition",
          "placeholder:text-luxury-text/70 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/15",
          className,
        )}
        id={inputId}
        {...props}
      />
      {error ? <span className="mt-2 block text-xs text-red-600">{error}</span> : null}
      {!error && helperText ? (
        <span className="mt-2 block text-xs text-luxury-text">{helperText}</span>
      ) : null}
    </label>
  );
}
